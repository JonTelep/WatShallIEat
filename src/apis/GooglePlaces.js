import axios from "axios";

const KEY = `${process.env.REACT_APP_API_GOOGLE_PLACES}`;

export default axios.create({
  baseURL: "https://maps.googleapis.com",
    params : {
        part: 'snippet',
        maxResults: 5,
        key: KEY
    }
});