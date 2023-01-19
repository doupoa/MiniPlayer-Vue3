<script setup>
	import {
		ref,
		inject
	} from 'vue'
	
	const props = defineProps({
		show: Boolean,
		inputData:null
	})
	
	const emit = defineEmits(['close','refreshInfo'])
	const axios = inject("$axios")
	const server_url = inject("$serverUrl")
	const reqCode = inject("$reqCode")
	const Base64 = inject("$base64")
	
	const uploading=ref(false)
	const success =ref(false)
	
	const id = ref('')
	const song_name=ref('')
	const composer=ref('')
	const song_url=ref('')
	const lyric=ref('')
	const img_url=ref('')
	
	function submitData(){
		uploading.value = true
		if(song_url.value.value == ''){
			alert('歌曲链接不得为空')
			return;
		}
		
		axios.post(server_url+'/updatesong',{
				"id":id.value.value,
				"song_name":song_name.value.value==''?'未知曲名':song_name.value.value,
				"composer":composer.value.value==''?'未知作曲家':composer.value.value,
				"song_url":song_url.value.value,
				"lyric": Base64.encode(lyric.value.value), //清除换行
				"img_url":img_url.value.value
		},{
			headers:{
				'X-Auth-Token': localStorage.getItem('refresh_token')
			},
		}
		).then(function(response){
			success.value = true
			setTimeout(function(){success.value=false;emit('refreshInfo');emit('close');},2000)
		})
		uploading.value = false
	}
</script>

<template>
	<Transition name="modal">
		<div v-if="show" class="modal-mask">
			<div class="modal-wrapper">
				<div class="modal-container">
					<div class="modal-header">
						<h3>{{inputData?'修改歌曲信息':'新建歌曲信息'}}</h3>
					</div>
					<div class="modal-body">
						<div class="input-form">
							<input type="hidden" :value="inputData?inputData.id:''" ref="id">
							<p>歌曲名:</p>
							<input type="text" :value="inputData?inputData.song_name:''" ref="song_name" maxlength="20">
							<p>作曲家:</p>
							<input type="text" :value="inputData?inputData.composer:''" ref="composer" maxlength="20">
							<p>歌曲在线链接:</p>
							<input type="text" :value="inputData?inputData.song_url:''" ref="song_url"  maxlength="255">
							<p>图片在线链接:</p>
							<input type="text" :value="inputData?inputData.img_url:''" ref="img_url" maxlength="255">
							<p>歌词:</p>
							<textarea ref="lyric" cols="55" rows="10" :value="inputData?Base64.decode(inputData.lyric):''"></textarea>
						</div>
					</div>

					<div class="modal-footer">
						
						<div v-if="uploading">
							<i class="fa-solid fa-circle-notch fa-spin icon"></i>
						</div>
						<div v-else-if="success" style="color: green;">
							<i class="fa-solid fa-circle-check"></i> Success
						</div>
						<div v-else>
							<button class="modal-default-button" @click="submitData"><p>确定</p></button>
							<button class="modal-default-button" @click="$emit('close')">取消</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Transition>
</template>

<style>
	.modal-mask {
		position: fixed;
		z-index: 9998;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: table;
		transition: opacity 0.3s ease;
	}

	.modal-wrapper {
		display: table-cell;
		vertical-align: middle;
	}

	.modal-container {
		width: 75%;
		max-width: 500px;
		margin: 0px auto;
		padding: 20px 30px;
		background-color: #fff;
		border-radius: 2px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
		transition: all 0.3s ease;
		border-radius: 15px;
	}

	.modal-header h3 {
		margin-top: 0;
		color: #532ab9;
		font-weight: bold;
		font-size: 20px;
	}

	.modal-body {
		margin: 20px 0;
	}
	
	.input-form input{
		line-height: 1.5;
	}
	
	.input-form p {
		font-weight: bold;
		margin: 10px 0px 3px 0px;
	}

	.modal-default-button {
		position: relative;
		display: inline-block;
		border: none;
		background-color: transparent;
		outline: none;
		font-size: 16px;
		color: #532ab9;
		cursor: pointer;
	}


	.modal-enter-from {
		opacity: 0;
	}

	.modal-leave-to {
		opacity: 0;
	}

	.modal-enter-from .modal-container,
	.modal-leave-to .modal-container {
		-webkit-transform: scale(1.1);
		transform: scale(1.1);
	}
</style>
