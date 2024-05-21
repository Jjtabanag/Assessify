import { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {

    const [file, setFile] = useState(null)


    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('file', file);
      
        try {
          const response = await axios.post('http://localhost:300/api/upload/', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
      
          console.log('File uploaded successfully', response.data);
        } catch (error) {
          console.error('Error uploading file', error);
        }
    };

    return (
        <div>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload}>Upload</button>
        </div>
    );
}

export default FileUpload