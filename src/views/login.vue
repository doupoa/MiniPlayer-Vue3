<script setup>
	import {
		ref,
		inject,
		reactive
	} from 'vue'
	import {
		useRouter
	} from 'vue-router'
	import JSEncrypt from 'jsencrypt'

	let encrypt = new JSEncrypt()
	const router = useRouter()
	 
	const axios = inject("$axios")
	const server_url = inject("$serverUrl")
	const reqCode = inject('$reqCode')
	const rsaKey = inject('$rsaKey')
	

	// 内部变量 Internal variable
	let login_res = null
	let serverUrl = ''


	// 公开变量 Expose variables
	let mode = ref(true) // T-login F-register
	let Pushing = ref(false)
	let failedInfo = ref('')
	let passwd = ref('')
	let username = ref('')

	async function postForm() {
		if (!username.value.value || !passwd.value.value) {
			failedInfo.value = mode.value ? reqCode['10006'] : reqCode['11006']
			return
		}
		failedInfo.value = ''
		Pushing.value = true
		serverUrl = server_url
		serverUrl += mode.value ? '/login' : '/register'
		await axios.post(serverUrl, {
			"un": username.value.value,
			"pw": RSAencrypt(passwd.value.value)
		}).then(function(response) {
			if (response.data.status == '10001') {
				localStorage.setItem('token',response.data.token)
				localStorage.setItem('refresh_token',response.data.refresh_token)
				router.push({name: 'index'})
			} else if (response.data.status == '11001') {
				alert(reqCode['11001'])
				changeMode()
				router.push({name: 'index'})
			} else {
				failedInfo.value = reqCode[response.data.status]
			}
		}).catch(function(error) {
			failedInfo.value = mode.value ? reqCode["10005"] : reqCode['11008']
		})
		Pushing.value = false
	}


	function changeMode() {
		mode.value = !mode.value
		failedInfo.value = ''
	}

	function RSAencrypt(text) {
		encrypt.setPublicKey(rsaKey)
		return encrypt.encrypt(text)
	}
</script>

<template>
	<div class="wrapper">
		<div class="login-main">
			<div v-if="mode">
				<p style="font-size: 2em;text-align: center;font-weight: bold;">Login</p>
				<p style="color:#989898;text-align: center;margin-top: 5px;" @click="changeMode">Register</p>
				<form>
					<div class="input-item">
						<label for="username">
							<i class="fa-solid fa-user fa-lg"></i>
						</label>
						<input type="text" id="username" autofocus="autofocus" required="required" ref="username"
							placeholder="Username" autocomplete="username">
					</div>
					<div class="input-item">
						<label for="passwd">
							<i class="fa-solid fa-key fa-lg"></i>
						</label>
						<input type="password" id="passwd" ref="passwd" autocomplete="current-password"
							placeholder="Password" onfocus="this.select()">
					</div>
				</form>
			</div>

			<div v-else>
				<p style="color:#989898;text-align: center;margin-top: 5px;" @click="changeMode">Login</p>
				<p style="font-size: 2em;text-align: center;font-weight: bold;">Register</p>

				<form>
					<div class="input-item">
						<label for="username">
							<i class="fa-solid fa-user fa-lg"></i>
						</label>
						<input type="text" id="username" autofocus="autofocus" required="required" ref="username"
							autocomplete="username" placeholder="New Username">
					</div>
					<div class="input-item">
						<label for="passwd">
							<i class="fa-solid fa-key fa-lg"></i>
						</label>
						<input type="password" id="passwd" ref="passwd" autocomplete="new-password"
							placeholder="New Password" onfocus="this.select()">
					</div>
				</form>
			</div>


			<div v-if="failedInfo.length" style="color:red;font-size: 8px;margin:15px auto;">
				<i class="fa-solid fa-circle-exclamation">&nbsp;&nbsp;{{failedInfo}}</i>
			</div>

			<div class="controls">
				<div class="controls__item" @click="postForm">
					<i class="fa-solid fa-circle-notch fa-spin icon" v-if="Pushing"></i>
					<i class="fa-solid fa-right-to-bracket icon" v-else></i>

				</div>
			</div>

		</div>
	</div>
</template>

<style>
	.login-main {
		background: #eef3f7;
		width:80%;
		max-width:440px;
		min-height: 240px;
		box-shadow: 0px 15px 35px -5px rgba(50, 88, 130, 0.32);
		border-radius: 15px;
		padding: 20px;
	}

	.input-item {
		display: block;
		position: relative;
		overflow: hidden;
		align-items: center;
		display: flex;
		justify-content: space-between;
		box-sizing: border-box;
		margin: 20px 10px;

	}

	.input-item label {
		font-size: 100%;
		display: block;
		text-align: center;
		padding-top: 10px;
		margin-right: 20px;

	}

	input {
		font-size: 15px;
		color: #555555;
		line-height: 1.2;
		display: block;
		width: 100%;
		background: transparent;
		padding: 0 5px;
		transition: all .3s ease;
		outline: none;
		border: none;
		border-bottom: 2px solid #b2b2b2;
		line-height: 36px;
	}

	input:hover {
		border-bottom: 2px solid #532ab9;
	}

	input:focus {
		outline-offset: 0px;
		border-bottom: 3px solid #532ab9;
	}

	.controls {
		flex: 1;
		padding-left: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}


	.controls__item {
		display: inline-flex;
		font-size: 30px;
		padding: 5px;
		margin-bottom: 10px;
		color: #acb8cc;
		cursor: pointer;
		width: 50px;
		height: 50px;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: all 0.3s ease-in-out;
	}

	.controls__item:before {
		content: "";
		position: absolute;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: #fff;
		transform: scale(0.5);
		opacity: 0;
		box-shadow: 0px 5px 10px 0px rgba(76, 70, 124, 0.2);
		transition: all 0.3s ease-in-out;
		transition: all 0.4s cubic-bezier(0.35, 0.57, 0.13, 0.88);
	}

	.controls__item:hover::before {
		opacity: 1;
		transform: scale(1.3);
	}

	.controls__item:hover {
		color: #532ab9;
	}

	.controls__item:active::before {
		opacity: 1;
		transform: scale(1.3);
	}

	.controls__item .icon {
		position: relative;
		z-index: 2;
		text-align: center;
	}
</style>
