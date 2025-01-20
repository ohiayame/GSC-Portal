document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
        fetch(`view_notice.php?id=${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    document.getElementById('notice-title').textContent = data.title;
                    document.getElementById('notice-target').textContent = data.target;
                    document.getElementById('notice-date').textContent = data.date;
                    document.getElementById('notice-writer').textContent = data.writer;
                    document.getElementById('notice-content').textContent = data.contents;
                }
            })
            .catch(error => console.error('Error fetching notice:', error));
    } else {
        alert('공지사항 ID가 제공되지 않았습니다.');
    }
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }
});