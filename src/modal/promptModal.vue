<script setup>
	import {
		ref,
		inject
	} from 'vue'
	const props = defineProps({
		show: Boolean,
		songID:null,
	})
	const emit = defineEmits(['close','refreshInfo'])
	const axios = inject("$axios")
	const server_url = inject("$serverUrl")
	const reqCode = inject("$reqCode")

	let deleting = ref(false)
	let success = ref(false)

	function deleteSong() {
		deleting.value = true
		axios.get(server_url+'/delsong',{
			headers: {
				'X-Auth-Token': localStorage.getItem('refresh_token')
			},
			params:{
				"song_id":props.songID
			},
		}).then(function(response){
			if(response.data.status=='13002'){
				alert(reqCode[response.data.status])
				emit('close')
			}
			deleting.value = false
			success.value = true
			setTimeout(function(){success.value=false;emit('refreshInfo');emit('close');},2000)

		}).catch(function(error){
			deleting.value = false
			alert("error")
			emit('close')
		})
		
		
	}
</script>

<template>
	<Transition name="modal">
		<div v-if="show" class="modal-mask">
			<div class="modal-wrapper">
				<div class="modal-container">
					<div class="modal-header">
						<slot name="header"></slot>
					</div>
					<div class="modal-body">
						<slot name="body"></slot>
					</div>
					<div class="modal-footer">
						<div v-if="deleting">
							<i class="fa-solid fa-circle-notch fa-spin icon"></i>
						</div>
						<div v-else-if="success" style="color: green;">
							<i class="fa-solid fa-circle-check"></i> 成功
						</div>
						<div v-else>
							<button class="modal-default-button" @click="deleteSong"><p>好</p></button>
							<button class="modal-default-button" @click="$emit('close')">再考虑下</button>
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
		width: 300px;
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

	.modal-footer {
		text-align: right;
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
