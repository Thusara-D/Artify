export default function authHeader() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token || user?.accessToken;

    if (token) {
        return { Authorization: 'Bearer ' + token };
    } else {
        return {};
    }
}
