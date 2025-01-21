document.addEventListener('DOMContentLoaded', function () {
    let currentPage = 1;
    const itemsPerPage = 5;
    let totalPages = 1;
    let currentTarget = "";

    // 현재 페이지 URL 확인
    const currentPath = window.location.pathname;
    function fetchNotices(page, target = '') {
    const targetParam = target ? `&target=${encodeURIComponent(target)}` : '';
    fetch(`notice.php?page=${page}&itemsPerPage=${itemsPerPage}${targetParam}`)
        .then(response => response.json())
        .then(data => {
            console.log('Fetched Notices:', data);
            totalPages = data.totalPages; // 동적으로 totalPages 업데이트
            displayNotices(data.notices);
            updatePagination(totalPages);
        })
        .catch(error => console.error('Error fetching notices:', error));
    }

    function displayNotices(notices) {
        const tableBody = document.getElementById('noticeTableBody');
        const rows = tableBody.querySelectorAll('tr');

        // 공지사항 데이터 렌더링
        notices.forEach((notice, index) => {
            if (index < rows.length){
                const cells = rows[index].querySelectorAll('td');
                rows[index].setAttribute('data-id', notice.noticeID);
                console.log(`Row ${index}: Notice ID = ${notice.noticeID}`);
                cells[1].textContent = notice.target || '';
                cells[2].textContent = notice.title || ''; // 제목
                cells[3].textContent = notice.date || '';  // 날짜
            }
        });

        // 남은 행은 빈칸으로 채우기
        for (let i = notices.length; i < rows.length; i++) {
            const cells = rows[i].querySelectorAll('td');
            rows[i].removeAttribute('data-id');
            cells[1].textContent = ''; // 빈 날짜
            cells[2].textContent = '';
            cells[3].textContent = '';
        }
        attachRowClickEvents();
    }

    function updatePagination(totalPages) {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pageNum = document.getElementById('pageNum');

        prevBtn.disabled = currentPage === 1; // 이전 버튼 비활성화 조건
        nextBtn.disabled = currentPage === totalPages; // 다음 버튼 비활성화 조건
        pageNum.textContent = currentPage; // 현재 페이지 표시
    }

    function changePage(direction) {
        const newPage = currentPage + direction;
        if (newPage < 1 || newPage > totalPages) return;
        currentPage = newPage;
        fetchNotices(currentPage, currentTarget);
    }

    // 필터링 이벤트 추가
    document.getElementById('targetSelect').addEventListener('change', (e) => {
        currentTarget = e.target.value; // 선택된 target 값
        currentPage = 1; // 첫 페이지로 초기화
        fetchNotices(currentPage, currentTarget); // 새로운 필터 값으로 데이터 로드
    });
    const targetSelect = document.getElementById('targetSelect');
    currentTarget = targetSelect.value; // select의 기본값 가져오기
    fetchNotices(currentPage, currentTarget); 

    // 페이지네이션 버튼 이벤트
    document.getElementById('prevBtn').addEventListener('click', () => changePage(-1));
    document.getElementById('nextBtn').addEventListener('click', () => changePage(1));


    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    document.getElementById('deleteBtn').addEventListener('click', function () {
        // 선택된 체크박스의 ID 수집
        const selectedIds = Array.from(document.querySelectorAll('.noticeCheckbox:checked'))
            .map(checkbox => checkbox.getAttribute('data-id'));
    
        if (confirm('선택한 공지사항을 삭제하시겠습니까?')) {
            // PHP로 데이터 전송
            fetch('notice.php?action=delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', ids: selectedIds })
            })
            .then(response => response.text())
            .then(result => {
                if (result.trim() === 'success') {
                    alert('선택한 공지사항이 삭제되었습니다.');
                    location.reload();
                } else {
                    alert('삭제에 실패했습니다: ' + result);
                }
            })
            .catch(error => console.error('Error deleting notices:', error));
        }
    });
    
});