<script>
export default {
    data() {
        return {
        name: "",         // 입력된 이름
        email: "",        // 입력된 이메일
        users: []         // 사용자 목록
        };
    },
    methods: {
        async fetchUsers() {
            try {
                const response = await fetch("http://localhost:5000/users");
                if (!response.ok) {
                    throw new Error(`HTTP 오류: ${response.status}`);
                }
                this.users = await response.json();
            } catch (error) {
                console.error("데이터 불러오기 실패:", error);
            }
        },
        async addUser() {
            try {
                const response = await fetch("http://localhost:5000/users", {
                method: "POST",
                headers: {
                    // 이게 JSON인지, 일반 텍스트인지, XML인지를 명시
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: this.name,
                    email: this.email
                })
                });

                if (!response.ok) {
                throw new Error(`HTTP 오류: ${response.status}`);
                }

                const newUser = await response.json();   // 서버 응답을 JSON으로 변환
                this.users.push(newUser); // 목록에 추가
                alert(`사용자 추가 성공: ${newUser.name}`);
                this.name = "";
                this.email = "";  // 입력 필드 초기화
            } catch (error) {
                console.error("사용자 추가 실패:", error);
            }
        }
    },
    mounted() {
        this.fetchUsers();  // 처음 화면이 렌더링될 때 사용자 목록 가져오기
    }
};
</script>

<template>
    <div>
        <h1>사용자 추가 및 목록</h1>
        
        <form @submit.prevent="addUser">
            <input v-model="name" placeholder="이름 입력" />
            <input v-model="email" placeholder="이메일 입력" />
            <button type="submit">사용자 추가</button>
        </form>

        <ul>
        <li v-for="user in users" :key="user.id">
            {{ user.name }} ({{ user.email }})
        </li>
        </ul>
    </div>
</template>

<style scoped>
    input {
    display: block;
    margin-bottom: 10px;
    padding: 5px;
    }
    button {
    padding: 5px 10px;
    cursor: pointer;
    }
</style>
