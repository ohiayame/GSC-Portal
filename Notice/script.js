document.addEventListener('DOMContentLoaded', function () {
    let currentPage = 1;
    const itemsPerPage = 5;

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
        function fetchNotices(page) {
            fetch(`notice.php?page=${page}&itemsPerPage=${itemsPerPage}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Fetched Notices:', data);
                    displayNotices(data.notices);
                    updatePagination(data.totalPages);
                })
                .catch(error => console.error('Error fetching notices:', error));
        }

        function displayNotices(notices) {
            const tableBody = document.getElementById('noticeTableBody');
            tableBody.innerHTML = '';

            const totalRows = 5; // 고정된 테이블 행 개수
            const rowsToAdd = totalRows - notices.length; // 부족한 행 계산

            // 공지사항 데이터 렌더링
            notices.forEach(notice => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${notice.title || ''}</td>
                    <td>${notice.date || ''}</td>
                `;
                tableBody.appendChild(row);
            });

            // 부족한 행만큼 빈 행 추가
            for (let i = 0; i < rowsToAdd; i++) {
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = `
                    <td>&nbsp;</td> <!-- 빈 셀 -->
                    <td>&nbsp;</td> <!-- 빈 셀 -->
                `;
                tableBody.appendChild(emptyRow);
            }
        }

        function updatePagination(totalPages, page) {
            currentPage = page;
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const pageNum = document.getElementById('pageNum');

            prevBtn.disabled = page === 1; // 첫 번째 페이지면 이전 버튼 비활성화
            nextBtn.disabled = page >= totalPages; // 마지막 페이지면 다음 버튼 비활성화
            pageNum.textContent = page // 현재 페이지 표시
        }

        function changePage(direction) {
            const newPage = currentPage + direction;
            fetchNotices(newPage);
        }
        
        // 페이지네이션 버튼 이벤트
        document.getElementById('prevBtn').addEventListener('click', () => changePage(-1));
        document.getElementById('nextBtn').addEventListener('click', () => changePage(1));
        // 초기 로드
        fetchNotices(currentPage);

        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.history.back();
            });
        }
    }
});
