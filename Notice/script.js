document.addEventListener('DOMContentLoaded', function () {
    let currentPage = 1;
    const itemsPerPage = 5;
    let totalPages = 1;
    let currentTarget = "";

    // 현재 페이지 URL 확인
    const currentPath = window.location.pathname;

    // 공지사항 등록 페이지 처리
    if (currentPath.includes('create.html')) {
        const form = document.getElementById('noticeForm');
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                const formData = new FormData(form);

                // action 추가
                formData.append('action', 'add');

                // 디버깅: FormData 내용 확인
                for (let pair of formData.entries()) {
                    console.log(`${pair[0]}: ${pair[1]}`);
                }

                fetch('notice.php', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.text())
                    .then(result => {
                        console.log('Result:', result.trim());
                        if (result.trim() === 'success') {
                            alert('공지사항이 등록되었습니다.');
                            window.location.href = 'notice_main.html';
                        } else {
                            alert('등록에 실패했습니다: ' + result);
                        }
                    })
                    .catch(error => console.error('Error:', error));
            });
        } 
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.history.back();
            });
        }
    }

    // 공지사항 표시 페이지 처리
    if (currentPath.includes('notice_main.html')) {
        function fetchNotices(page, target = '') {
            const targetParam = target ? `&target=${encodeURIComponent(target)}` : '';
            fetch(`notice.php?page=${page}&itemsPerPage=${itemsPerPage}${targetParam}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Fetched Notices:', data);
                    totalPages = data.totalPages; // totalPages 업데이트
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
                    cells[0].textContent = (currentPage - 1) * itemsPerPage + index + 1;
                    cells[1].textContent = notice.target || '';
                    cells[2].textContent = notice.title || ''; // 제목
                    cells[3].textContent = notice.date || '';  // 날짜
                }
            });
        
            // 남은 행은 빈칸으로 채우기
            for (let i = notices.length; i < rows.length; i++) {
                const cells = rows[i].querySelectorAll('td');
                cells[0].textContent = (currentPage - 1) * itemsPerPage + i + 1;
                cells[1].textContent = ''; // 빈 날짜
                cells[2].textContent = '';
                cells[3].textContent = '';
            }
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
    }
});
