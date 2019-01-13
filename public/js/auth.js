document
    .getElementById('auth')
    .addEventListener("click", () => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status != 200) {
                    document
                        .getElementById('error')
                        .innerHTML = JSON.parse(xhr.responseText)["status"];
                } else {
                    window.location = '/'
                }
            }
        }
        xhr.open("POST", '/login', true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify({
            username: document
                .getElementById('user')
                .value,
            password: document
                .getElementById('pass')
                .value
        }));
    });

