const http = require("http");
const fs = require("fs");
const path = require("path");
const {MongoClient} = require("mongodb");

// Port number that server listens to
const PORT = 1143;

const getJobsData = async (client) =>{
    //Fetches records from given database
    const cursor = client.db("JobDB").collection("JobList").find({});
    const results = await cursor.toArray();
    return JSON.stringify(results);
}

http.createServer(async (req,res)=>{
    if(req.url === "/api"){
        const URL = "mongodb+srv://skani3:Lohi%40123458@cluster0.qergeef.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        // Creating a new client for connecting to database
        const client = new MongoClient(URL);
        try{
             //Connects to database
            await client.connect();
            console.log("Database is connected sucessfully");
            const jobList = await getJobsData(client);
            //Handling CORS Issue
            res.setHeader("Access-Control-Allow-Origin","*");
            res.writeHead(200,{"content-type":"application/json"});
            res.end(jobList);
        }
        catch(err){
            console.log("Error in connecting database",err);
        }
        finally{
            //Closing connection to database
            await client.close();
            console.log("Database connection is closed");
        }
    }
    else{
        console.log(req.url);
        let contentType;
        const filePath = path.join(__dirname,"public",req.url==="/"?"index.html":req.url.slice(1));
        //Assigning content type based on file extension
        if(filePath.endsWith(".png")) contentType = "image/png";
        else if(filePath.endsWith(".jpeg") || filePath.endsWith(".jpg")) contentType = "image/jpeg";
        else contentType = "text/html";
        fs.readFile(filePath,(err,content)=>{
            if(err){
                if (err.code === "ENOENT") {
                    res.writeHead(404,{"content-type":"text/html"});
                    res.end("<h1>404 Page Not Found!</h1>");
                } else {
                    // Handle other errors
                    res.writeHead(500,{"content-type":"text/plain"});
                    res.end("Internal Server error");
                }
            }
            else{
                res.writeHead(200,{"content-type":contentType});
                res.end(content,"utf8");
            }
        })
    }
}).listen(PORT,()=>console.log(`Server is running on ${PORT}`))