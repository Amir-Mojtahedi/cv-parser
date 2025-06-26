type SerializableFile = {
  name: string;
  type: string;
  size: number;
  content: string; // base64 encoded string
};

export default SerializableFile;
