

// 항목 데이터
const notices = [
    { title: "공지사항 제목 1", date: "2025-01-15" },
    { title: "공지사항 제목 2", date: "2025-01-14" },
    { title: "공지사항 제목 3", date: "2025-01-13" },
    { title: "공지사항 제목 4", date: "2025-01-12" },
    { title: "공지사항 제목 5", date: "2025-01-11" },
    { title: "공지사항 제목 6", date: "2025-01-10" },
    { title: "공지사항 제목 7", date: "2025-01-09" },
    { title: "공지사항 제목 8", date: "2025-01-08" },
    { title: "공지사항 제목 9", date: "2025-01-07" },
    { title: "공지사항 제목 10", date: "2025-01-06" },
    { title: "공지사항 제목 11", date: "2025-01-05" },
    { title: "공지사항 제목 12", date: "2025-01-04" }
];
// 페이지 항목 수
const itemsPerPage = 5;
let currentPage = 1;

function addEmptyRows() {
    const totalRows = notices.length;
    const remainder = totalRows % itemsPerPage;
    
    if (remainder !== 0) {
        const emptyRows = itemsPerPage - remainder;  // 부족한 빈 행의 개수
        for (let i = 0; i < emptyRows; i++) {
            notices.push({ title: "", date: "" });  // 빈 항목 추가
        }
    }
}

function displayNotices(page) {
    addEmptyRows();  // 부족한 행을 빈 항목으로 추가
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedNotices = notices.slice(start, end);

    const tableBody = document.getElementById('noticeTableBody');
    tableBody.innerHTML = '';  // 기존 내용 초기화

    paginatedNotices.forEach(notice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="#" class="view-more" onclick="viewNotice('${notice.title}')">${notice.title}</a></td>
            <td class="date">${notice.date}</td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById('pageNum').textContent = page;
    document.getElementById('prevBtn').disabled = page === 1;
    document.getElementById('nextBtn').disabled = page * itemsPerPage >= notices.length;
}

function changePage(direction) {
    currentPage += direction;
    displayNotices(currentPage);
}

// 클릭한 제목의 상세내용 보기
function viewNotice(title) {
    alert('선택된 공지사항 제목: ' + title);
}

// 페이지가 로드되면 공지사항 표시
window.onload = () => {
    displayNotices(currentPage); // currentPage를 명시적으로 전달
};


// script.js
document.getElementById('backButton').addEventListener('click', () => {
    alert('돌아가기 버튼이 눌렸습니다.');
    window.history.back();
});

document.getElementById('noticeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const target = document.getElementById('target').value;
    const content = document.getElementById('content').value;

    alert(`제목: ${title}\n공지 대상: ${target}\n내용: ${content}`);
});
