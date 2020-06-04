// import { encode } from 'base64-arraybuffer';
import ab2b64 from 'ab2b64';
import CryptoJS from 'crypto-js';
import JSZip from 'jszip';
import b64toBlob from 'b64-to-blob';

export const fileToArrayBuffer = file => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = function onerror(ev) {
            reject(ev.target.error);
        }

        reader.onload = function onload(ev) {
            resolve(ev.target.result);
        }

        reader.readAsArrayBuffer(file);
    })
}

// export const arrayBufferToBase64 = async buffer => {
//     return new Promise(resolve => {
//         return resolve(encode(buffer));
//     })
// }

export const getSHA256 = value => {
    return new Promise(resolve => {
        return resolve(CryptoJS.SHA256(value).toString());
    })
}

export const base64ToBlob = string => {
    return new Promise(resolve => {
        return resolve(b64toBlob(string));
    })
}

export const encrypt = async (file, password, encryption, mode) => {
    let array = await fileToArrayBuffer(file);
    let data = await ab2b64.ab2b64Async(array);

    const key = await getSHA256(password);

    const encrypted = await CryptoJS[encryption].encrypt(data, key, { mode: CryptoJS.mode[mode] }).toString();

    const md5 = await CryptoJS.MD5(data).toString();

    const sha256HashBefore = await CryptoJS[encryption].encrypt(await getSHA256(data), key, { mode: CryptoJS.mode[mode] }).toString();
    const sha256HashAfter = await CryptoJS[encryption].encrypt(await getSHA256(encrypted), key, { mode: CryptoJS.mode[mode] }).toString();

    const filename = await CryptoJS[encryption].encrypt(file.name, key, { mode: CryptoJS.mode[mode] }).toString();

    const metadata = {
        filename: filename,
        sha256HashBefore: sha256HashBefore,
        sha256HashAfter: sha256HashAfter
    }

    let zip = new JSZip();
    zip.file('.meta', JSON.stringify(metadata));
    zip.file('file', encrypted, {
        base64: true
    });

    const newZip = await zip.generateAsync({
        type: 'blob'
    });

    return {
        file: newZip,
        name: md5 + '.encrypt'
    }
}

export const decrypt = async (file, password, encryption, mode) => {
    const key = await getSHA256(password);

    const zip = await JSZip.loadAsync(file)
        .catch(() => {
            return {
                file: null,
                error: 'not-encrypted-file',
                name: null
            }
        });
    if (zip.error) {
        return zip;
    }
    const metadata = JSON.parse(await zip.file('.meta').async('string'));
    const content = await zip.file('file').async('base64');

    try {
        const decrypted = await CryptoJS[encryption].decrypt(content, key, { mode: CryptoJS.mode[mode] }).toString(CryptoJS.enc.Utf8);

        const sha256HashBefore = await getSHA256(decrypted);
        const sha256HashAfter = await getSHA256(content);

        const beforeCheck = await CryptoJS[encryption].decrypt(metadata.sha256HashBefore, key, { mode: CryptoJS.mode[mode] }).toString(CryptoJS.enc.Utf8) === sha256HashBefore;
        const afterCheck = await CryptoJS[encryption].decrypt(metadata.sha256HashAfter, key, { mode: CryptoJS.mode[mode] }).toString(CryptoJS.enc.Utf8) === sha256HashAfter;

        if (beforeCheck && afterCheck) {
            const filename = await CryptoJS[encryption].decrypt(metadata.filename, key, { mode: CryptoJS.mode[mode] }).toString(CryptoJS.enc.Utf8);

            const blob = await base64ToBlob(decrypted);
            const blobUrl = URL.createObjectURL(blob);

            return {
                file: blobUrl,
                error: null,
                name: filename
            }
        }
        return {
            file: null,
            error: "no-integrity",
            name: null
        };
    } catch (err) {
        return {
            file: null,
            error: 'key-incorrect-or-corrupted-or-wrong-algorithm',
            name: null
        }
    }
}
