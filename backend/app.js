const express = require('express');
const bodyParser = require('body-parser');
const cors=require('cors')
const multer = require('multer');

const { S3Client, CreateMultipartUploadCommand,UploadPartCommand , CompleteMultipartUploadCommand} = require('@aws-sdk/client-s3');

const upload = multer();
const app = express();
app.use(cors({
  origin:"http://localhost:3000"
}))
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


const config = {
  region:process.env.REGION, 
  credentials: {
    accessKeyId:process.env.ACCESS_KEY_ID,
    secretAccessKey:process.env.SECRET_ACCESS_KEY
  }
}

app.post('/start-upload', async(req, res) => {
  const s3 = new S3Client(config);
  
    const params = {
      Bucket:process.env.BUCKET ,
      Key: req.body.key,
      ContentType: req.body.contentType,
    };

    const data = await s3.send(new CreateMultipartUploadCommand(params));

  return res.json({uploadId:data. UploadId})
   
  });
  
  app.post('/upload-part',upload.single('data'), async(req, res) => {
    const s3 = new S3Client(config);
    const binaryData = req.file.buffer
  

    const params = {
      Bucket:process.env.BUCKET,
      Key: req.body.key,
      PartNumber: req.body.partNumber,
      UploadId: req.body.uploadId,
      Body:  req.file.buffer,
    };
  
    const command = new UploadPartCommand(params);
    const data = await s3.send(command);
   
   
    res.json({mess:data})
  });
  
  app.post('/complete-upload', async(req, res) => {
    const s3 = new S3Client(config);
    
    console.log(req.body.parts)
    console.log(req.body.key)
    console.log(req.body.uploadId)
    const params = {
      Bucket:process.env.BUCKET,
      Key: req.body.key,
      MultipartUpload: {
        Parts: req.body.parts,
      },
      UploadId: req.body.uploadId,
    };
  

    try {
      const data = await s3.send(new CompleteMultipartUploadCommand(params));
      // console.log('Multipart upload completed:', data.Location);
      return res.json({data:data})
      // Handle the response or perform additional actions as needed
    } catch (error) {
      console.error('Error completing multipart upload:', error);
      // Handle the error or send an appropriate response
    }
   


  });

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})