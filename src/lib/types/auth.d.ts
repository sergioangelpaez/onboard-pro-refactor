interface LocalUserResponse {
	user: User;
	token: string;
}

interface GetMeResponse {
	message: string;
	userData: User;
}
