import React from 'react';
import Select from 'react-select';
import Dropzone from 'react-dropzone';
import { encrypt } from './common';
import FileSaver from 'file-saver';
import encryption from './common/encryption.json';
import mode from './common/mode.json';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const App = () => {
    let [selectedEncryption, setSelectedEncryption] = React.useState(encryption[0]);
    let [selectedMode, setSelectedMode] = React.useState(mode[selectedEncryption.value][0]);
    let [status, setStatus] = React.useState(false);
    const passwd = React.useRef();

    //Functions
    const dropHandler = async files => {
        setStatus(true);
        for (const file of files) {
            let encrypted = await encrypt(file, passwd.current.value, selectedEncryption.value, selectedMode.value);
            // console.log(encrypted)
            Swal.fire(`Mã hoá thành công`, '', 'success');
            FileSaver.saveAs(encrypted.file, encrypted.name);
        }
        setStatus(false);
    }

    const encryptionHandler = option => {
        setSelectedEncryption(option);
        setSelectedMode(mode[selectedEncryption.value][0]);
    }

    const modeHandler = option => setSelectedMode(option);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 px-5 py-2" style={{ width: '60%' }}>
            <div className='row bg-light shadow p-5'>
                <div className="col-12 text-center mb-4">
                    <h1>Encrypt</h1>
                </div>
                <div className='col-6 mb-3'>
                    <label>1. Chọn thuật toán</label>
                    <Select classNamePrefix='select' onChange={encryptionHandler} value={selectedEncryption} instanceId='encryption' options={encryption} autoFocus={true} />
                </div>
                <div className='col-6 mb-3'>
                    <label>2. Chọn chế độ</label>
                    <Select classNamePrefix='select' onChange={modeHandler} value={selectedMode} instanceId='mode' options={selectedEncryption ? mode[selectedEncryption.value] : []} />
                </div>
                <div className="col-12 mb-3">
                    <label>3. Nhập mật khẩu</label><br />
                    <div className="input-group">
                        <input ref={passwd} type="password" className="form-control" placeholder="Mật khẩu" />
                    </div>
                </div>
                <div className="col-12 mb-3">
                    <label>4. Chọn file để mã hoá</label>
                    <Dropzone onDrop={dropHandler} id='dropzone'>
                        {({ getRootProps, getInputProps, isDragActive }) => (
                            <div>
                                <div {...getRootProps({ className: 'd-flex justify-content-center align-items-center', style: { height: '80px', border: '2px dashed #111' } })}>
                                    <input {...getInputProps()} />
                                    <p className='m-0'>{isDragActive ? `Thả file vào đây` : `Thả file vào đây, hoặc bấm để chọn file`}</p>
                                </div>
                            </div>
                        )}
                    </Dropzone>
                </div>
                <div className="col-12 mb-3">
                    {/* <ProgressBar progress={props.status?.status || 0} radius={100} /> */}
                    <p>{status && `Đang mã hoá...`}</p>
                </div>
                <div className="col-12 text-right">
                    <Link to='/decrypt'>
                        <h6>Giải mã ở đây</h6>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default App;
