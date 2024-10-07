// Handle the display of login and registration forms
document.getElementById('showRegister').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
});

document.getElementById('showLogin').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';   
});

// Handle Login Form Submission
document.getElementById('loginFormSubmit').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            // Save the JWT token to local storage
            localStorage.setItem('token', data.token);
            alert('Login successful!');
            // Redirect to your dashboard
            window.location.href = '/dashboard.html';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert('Something went wrong. Please try again.');
    }
});

// Handle Registration Form Submission
document.getElementById('registerFormSubmit').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmRegisterPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, }),
        });

        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! You can now log in.');
            document.getElementById('showLogin').click(); // Switch to login form
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Error registering:', error);
        alert('Something went wrong. Please try again.');
    }
});

// // File Upload Handling
// document.getElementById('fileInput').addEventListener('change', async function () {
//     const file = document.getElementById('fileInput').files[0];
//     const formData = new FormData();
//     formData.append('file', file);
//     const uploadProgress = document.getElementById('uploadProgress');

//     try {
//         uploadProgress.innerHTML = 'Uploading...';

//         const response = await fetch('/api/files/upload', {
//             method: 'POST',
//             body: formData,
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT token
//             }
//         });

//         const data = await response.json();
//         if (response.ok) {
//             uploadProgress.innerHTML = 'Upload successful!';
//             fetchUserFiles(); // Refresh file list
//         } else {
//             throw new Error(data.message || 'Upload failed!');
//         }
//     } catch (error) {
//         uploadProgress.innerHTML = 'Upload failed!';
//         console.error('Error uploading file:', error);
//         alert(error.message);
//     }
// });
////////////////////////////////
// Handle File Upload
async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const uploadProgress = document.getElementById('uploadProgress');

    const token = localStorage.getItem('token');

    if (!file) {
        alert('Please select a file to upload.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        uploadProgress.innerHTML = 'Uploading...';

        const response = await fetch('/api/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`, // Pass JWT for authentication
            },
            body: formData, // FormData for file upload
        });

        const data = await response.json();

        if (response.ok) {
            uploadProgress.innerHTML = 'Upload successful!';
            fetchUserFiles(); // Refresh file list
        } else {
            throw new Error(data.message || 'Upload failed!');
        }
    } catch (error) {
        uploadProgress.innerHTML = 'Upload failed!';
        console.error('Error uploading file:', error);
        alert(error.message);
    }
}

// Fetch User Files
async function fetchUserFiles() {
    const fileGrid = document.getElementById('fileGrid');

    try {
        const response = await fetch('/api/files', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`, // Pass JWT for authentication
            },
        });

        const data = await response.json();
        if (response.ok) {
            displayFiles(data.files);
        } else {
            throw new Error(data.message || 'Failed to fetch files.');
        }
    } catch (error) {
        console.error('Error fetching files:', error);
        fileGrid.innerHTML = '<p>Error fetching files. Please try again later.</p>';
    }
}

// Display User Files in the Dashboard
function displayFiles(files) {
    const fileGrid = document.getElementById('fileGrid');
    fileGrid.innerHTML = ''; // Clear previous file list

    if (files.length > 0) {
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.classList.add('file-item');
            fileItem.innerHTML = `
                <p>${file.filename}</p>
                <button onclick="downloadFile('${file.url}')">Download</button>
                <button onclick="deleteFile('${file._id}')">Delete</button>
            `;
            fileGrid.appendChild(fileItem);
        });
    } else {
        fileGrid.innerHTML = '<p>No files found.</p>';
    }
}

// Download File
function downloadFile(url) {
    window.location.href = url;
}

// Delete File
async function deleteFile(fileId) {
    if (confirm('Are you sure you want to delete this file?')) {
        try {
            const response = await fetch(`/api/files/${fileId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Pass JWT for authentication
                },
            });

            const data = await response.json();
        if (response.ok) {
            uploadProgress.innerHTML = 'Upload successful!';
            fetchUserFiles(); // Refresh file list
        } else {
            throw new Error(data.message || 'Upload failed!');
        }
    } catch (error) {
        uploadProgress.innerHTML = 'Upload failed!';
        console.error('Error uploading file:', error);
        alert(error.message);
    }
}
};

// Logout Functionality
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/home.html'; // Redirect to the homepage
}
