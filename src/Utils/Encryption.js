import CryptoJS from "crypto-js";

// Use SHA256 to create a 256-bit key from the environment variable (ideal for AES-256)
const KEY = CryptoJS.SHA256(process.env.REACT_APP_SECRET_KEY || "");

export const encryptData = (data) => {
  try {
    const stringData = JSON.stringify(data);

    const encrypted = CryptoJS.AES.encrypt(stringData, KEY, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString();
  } catch (err) {
    console.error("Encryption error:", err);
    return null;
  }
};

export const decryptData = (encryptedData) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, KEY, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
      throw new Error("Decryption failed, no data returned.");
    }

    return JSON.parse(decryptedText);
  } catch (err) {
    console.error("Decryption error:", err);
    return null;
  }
};
