<script setup>
import {
	ref,
	computed,
	reactive,
	inject,
	onMounted,
	onBeforeMount
} from 'vue'
import {
	TweenMax,
	gsap
} from 'gsap'
import {
	useRouter
} from 'vue-router'
import Modal from '../modal/promptModal.vue'
import inputModal from '../modal/inpitModal.vue'

const axios = inject("$axios")
const server_url = inject("$serverUrl")
const reqCode = inject('$reqCode')
const router = useRouter()
const Base64 = inject("$base64")


// 内部变量 Internal variable
let audio = new Audio()
let obj = {}
const regMin = /.*:/
const regSec = /:.*\./
const regMs = /\./
let min = 0
let sec = 0
let ms = 0
let delay = null
let current = null
let width = null
let durmin = null
let dursec = null
let curmin = null
let cursec = null
let lyricStart = 0
let lyricEnd = 0
let lyricTime = null
let playerDuration = null
let playerCurrent = null
let maxduration = null
let position = null
let percentage = null
let themeMedia = null


// 公开变量 Expose variables
let circleLeft = ref('')
let barWidth = ref('')
let duration = ref(null)
let currentTime = ref(null)
let isTimerPlaying = ref(false)
let currentTrack = ref([])
let currentTrackIndex = ref(0)
let transitionName = ref('')
let showLyric = ref(false)
let LyricIndex = ref(0)
let isShowCover = ref(false)
let progress = ref()
let themeMode = ref(false)
let showModal = ref(false)
let showInputModal = ref(false)
let InputModalData = ref([])
let songPage = ref(1)
let noMore = ref(false)
let nowLyric = computed(() => {
	if (data.musicLyric) {
		lyricStart = (LyricIndex.value == 0 ? 0 : LyricIndex.value - 1);
		lyricEnd = (data.musicLyric.length - LyricIndex.value <= 0 ? LyricIndex.value : LyricIndex.value + 2)
		return data.musicLyric.slice(lyricStart, lyricEnd);
	}
})
let randomImg = computed(() => {
	return '/img/' + (Math.floor(Math.random() * 21) + 1) + '.jpg'
})
let data = reactive({
	tracks: [],
	musicLyric: [],
})

function play() {
	if (audio.paused) {
		audio.play();
		isTimerPlaying.value = true;
	} else {
		audio.pause();
		isTimerPlaying.value = false;
	}
}

function prevTrack() {
	transitionName.value = "scale-in";
	isShowCover.value = false;
	if (currentTrackIndex.value > 0) {
		currentTrackIndex.value--;
	} else {
		currentTrackIndex.value = data.tracks.length - 1;
	}
	currentTrack.value = data.tracks[currentTrackIndex.value];
	resetPlayer();
}

function nextTrack() {
	transitionName.value = "scale-out";
	isShowCover.value = false;
	if (currentTrackIndex.value < (data.tracks.length - 1)) {
		currentTrackIndex.value++;
	} else {
		currentTrackIndex.value = 0;
	}
	currentTrack.value = data.tracks[currentTrackIndex.value];
	resetPlayer();
}

function jumpTrack(index) {
	transitionName.value = "scale-out";
	isShowCover.value = false;
	currentTrackIndex.value = index;
	currentTrack.value = data.tracks[currentTrackIndex.value];
	resetPlayer();
}

function favorite() {
	axios.get(server_url + '/favorite', {
		params: {
			'song_id': currentTrack.value.id,
			'mode': data.tracks[currentTrackIndex.value].favorited ? 1 : 0
		},
		headers: {
			'X-Auth-Token': localStorage.getItem('token')
		}
	}).then(function (response) {
			data.tracks[currentTrackIndex.value].favorited = !data.tracks[currentTrackIndex.value].favorited;

	})
}

function generateTime() {
	playerDuration = audio.duration
	playerCurrent = audio.currentTime
	width = (100 / playerDuration) * playerCurrent;
	barWidth.value = width + "%";
	circleLeft.value = width + "%";
	durmin = Math.floor(playerDuration / 60);
	dursec = Math.floor(playerDuration - durmin * 60);
	curmin = Math.floor(playerCurrent / 60);
	cursec = Math.floor(playerCurrent - curmin * 60);
	if (durmin < 10) {
		durmin = "0" + durmin;
	}
	if (dursec < 10) {
		dursec = "0" + dursec;
	}
	if (curmin < 10) {
		curmin = "0" + curmin;
	}
	if (cursec < 10) {
		cursec = "0" + cursec;
	}
	duration.value = durmin + ":" + dursec;
	currentTime.value = curmin + ":" + cursec;

	try {
		lyricTime = (data.musicLyric.length - (LyricIndex.value + 1) > 0 ? data.musicLyric[LyricIndex.value + 1].time :
			data.musicLyric[LyricIndex.value].time)
		if (playerCurrent > lyricTime && data.musicLyric.length - (LyricIndex.value + 1) > 0) {
			LyricIndex.value++;
		} else if (playerCurrent < lyricTime && data.musicLyric.length - (LyricIndex.value + 1) <= 0) {
			LyricIndex.value = 0
		}
	} catch { }
}

function Lyric() {
	showLyric.value = !showLyric.value;
}

function updateBar(x) {
	maxduration = audio.duration;
	position = x - progress.value.offsetLeft;
	percentage = (100 * position) / progress.value.offsetWidth;
	if (percentage > 100) {
		percentage = 100;
	}
	if (percentage < 0) {
		percentage = 0;
	}

	barWidth.value = percentage + "%";
	circleLeft.value = percentage + "%";
	audio.currentTime = (maxduration * percentage) / 100;
	audio.play();
}

function clickProgress(e) {
	isTimerPlaying.value = true;
	audio.pause();
	updateBar(e.pageX);
	LyricIndex.value = 0
}

function formatTime(strtime) {
	min = parseInt(strtime.match(regMin)[0].slice(0, 2));
	sec = parseInt(strtime.match(regSec)[0].slice(1, 3));
	ms = strtime.slice(strtime.match(regMs).index + 1, strtime.match(regMs).index + 3);
	if (min != 0) {
		sec += min * 60;
	}
	return Number(sec + '.' + ms);
}

function resetPlayer() {
	barWidth.value = '0%';
	circleLeft.value = '0%';
	audio.currentTime = 0;
	audio.src = currentTrack.value.song_url;
	LoadLyric();
	setTimeout(() => {
		if (isTimerPlaying.value) {
			audio.play();
		} else {
			audio.pause();
		}
	}, 300);
}

function lyricBeforeEnter(el) {
	el.style.opacity = 0
	el.style.height = 0
}

function lyricEnter(el, done) {
	gsap.to(el, {
		opacity: 1,
		height: '1.6em',
		delay: el.dataset.index * 0.15,
		onComplete: done
	})
}

function lyricLeave(el, done) {
	gsap.to(el, {
		opacity: 0,
		height: 0,
		delay: el.dataset.index * 0.15,
		onComplete: done
	})
}

function logout() {
	localStorage.clear()
	router.push({
		name: 'login'
	})
}

function loadMoreMusic() {
	songPage.value += 1
	getUserInfo()
}

function showinputModal(mode) {
	InputModalData.value = null
	if (mode == 'modify') { // modify
		InputModalData.value = currentTrack.value
	}
	showInputModal.value = true
}

function init_audio() {
	if (data.tracks[0] == null) {
		return;
	}
	currentTrack.value = data.tracks[0];
	audio.src = currentTrack.value.song_url;
	audio.ontimeupdate = function () {
		generateTime();
	};
	audio.onloadedmetadata = function () {
		generateTime();
	};
	audio.onended = function () {
		nextTrack();
		isTimerPlaying.value = true;
	};
	LoadLyric();
}

function changeTheme(mode) {
	if (mode == null) {
		themeMode.value = !themeMode.value
		console.log("themeMode:" + themeMode.value)
	} else {
		themeMode.value = mode
	}
	window.document.documentElement.setAttribute('data-theme', themeMode.value ? 'dark' : 'light')
}

async function LoadLyric() {
	data.musicLyric = []
	LyricIndex.value = 0
	try {
		if (currentTrack.value.lyric) {
			const lineArr = Base64.decode(currentTrack.value.lyric).split(/\n/);
			lineArr.forEach((item, index) => {
				if (item === '') return
				const time = item.match(/\[\d{2}:\d{2}.\d{2,3}\]/)
				obj = {}
				obj.id = index;
				obj.lyric = item.split(']')[1].trim() === '' ? '' : item.split(']')[1].trim();
				obj.time = time ? formatTime(time[0].slice(1, time[0].length - 1)) : 0;
				obj.uid = Math.random().toString().slice(-6);

				if (obj.lyric) {
					data.musicLyric.push(obj)
				}
			})
		}
	} catch { }


	if (data.musicLyric.length <= 0) {
		obj = {}
		obj.id = 1;
		obj.lyric = '暂无歌词';
		obj.time = 0;
		obj.uid = Math.random().toString().slice(-6);
		data.musicLyric.push(obj);
	}
}

async function getNewToken() {
	localStorage.removeItem('token')
	if (localStorage.getItem('refresh_token') == null) {
		return
	}
	await axios.get(server_url + '/refresh', {
		headers: {
			'X-Auth-Token': localStorage.getItem('refresh_token')
		}
	}).then(function (response) {
		if (response.data.status == '12001') {
			localStorage.setItem('token', response.data.token)
		}
	}).catch(function (error) {
		localStorage.clear()
		router.push({
			name: 'login'
		})
	})
}

async function getUserInfo() {
	if (localStorage.getItem('token') == null) {
		localStorage.clear()
		router.push({
			name: 'login'
		})
		return
	}
	await axios.get(server_url + '/userinfo', {
		params: {
			'page': songPage.value
		},
		headers: {
			'X-Auth-Token': localStorage.getItem('token')
		}
	}).then(function (response) {
		data.tracks = response.data
		if (data.tracks.length < songPage.value * 10) {
			noMore.value = true
		}
		init_audio()
	}).catch(async function (error) {
		try {
			if (error.response.status == 401) {
				await getNewToken()
				if (localStorage.getItem('token')) {
					getUserInfo()
					return
				} else {
					localStorage.clear()
					router.push({
						name: 'login'
					})
				}
			}
		} catch {
			localStorage.clear()
			router.push({
				name: 'login'
			})
		}

	})
}

onBeforeMount(async () => {
	await getUserInfo()
})

onMounted(() => {
	changeTheme(window.matchMedia("(prefers-color-scheme: dark)").matches)

	if (data.tracks.length == 0) {
		return
	}
	init_audio()
})
</script>

<template>
	<div class="top-bar">
		<div class="top-bar__item" @click="changeTheme(null)">
			<Transition>
				<i class="fa-solid fa-moon" v-if="themeMode"></i>
				<i class="fa-solid fa-sun" v-else></i>
			</Transition>
		</div>
		<div class="top-bar__item">
			<i class="fa-solid fa-compact-disc"></i>
			<div class="top-bar__menu" id="top-bar_menu">
				<div class="top-bar-menu__control" @click="showinputModal()"><i class="fa-solid fa-plus"></i></div>
				<ol id="musicList">
					<li v-for="(item, $index) in data.tracks" class="list_item">
						<div class="list_idx" v-if="currentTrack.id == item.id"><i class="fa-solid fa-play"
								style="color:#532ab9"></i></div>
						<div class="list_idx" v-else>{{ $index + 1 }}</div>
						<div class="song_name" @click="jumpTrack($index)">{{ item.song_name }}</div>
						<div>{{ item.composer }}</div>
					</li>
				</ol>
				<div class="top-bar-menu__control">
					<div v-if="noMore" style="font-size: 14px;margin-top:20px;">No More</div>
					<div v-else @click="loadMoreMusic"><i class="fa-solid fa-ellipsis"></i></div>
				</div>
			</div>
		</div>
		<div class="top-bar__item">
			<i class="fa-solid fa-user-gear"></i>
			<div class="top-bar__menu" id="top-bar_menu" style="width:80px;">
				<div class="menu-content">
					<i class="fa-solid fa-pen-to-square">
						<p>passwd</p>
					</i>
					<i class="fa-solid fa-right-from-bracket" @click="logout">
						<p>logout</p>
					</i>

				</div>
			</div>
		</div>
	</div>
	<div class="wrapper">
		<div class="player">
			<div class="player__top">
				<div class="player-cover">
					<transition-group :name="transitionName">
						<template v-if="data.tracks.length">
							<template v-for="(track, $index) in data.tracks">
								<div class="player-cover__item" v-if="$index == currentTrackIndex"
									:style="{ backgroundImage: `url(${track.img_url})` }" :key="$index"></div>
							</template>
						</template>
						<template v-else>
							<div class="player-cover__item" :style="{ backgroundImage: `url(${randomImg})` }" :key="0">
							</div>
						</template>

					</transition-group>
				</div>
				<div class="player-controls">

					<div @click="favorite" class="player-controls__item -favorite"
						:style="currentTrack ? Object.keys(currentTrack).length ? 'color:red' : '' : ''">
						<i class="fa-solid fa-heart icon"></i>
					</div>

					<div class="player-controls__item" @click="prevTrack">
						<i class="fa-solid fa-backward-step icon"></i>
					</div>
					<div class="player-controls__item" @click="nextTrack">
						<i class="fa-solid fa-forward-step icon"></i>
					</div>
					<div class="player-controls__item" @click="Lyric">
						<i class="fa-solid fa-language icon"
							:style="showLyric ? 'margin-right: 5px;color:green;' : 'margin-right: 5px;'"></i>
					</div>
					<div class="player-controls__item -xl js-play" @click="play">
						<i class="fa-solid fa-stop icon" style="color:darkred" v-if="isTimerPlaying"></i>
						<i class="fa-solid fa-play icon" style="color: royalblue;" v-else></i>
					</div>
				</div>
			</div>
			<div :class="showLyric ? 'player-lyric' : 'player-lyric hide'">
				<transition-group name="lyric-fade" tag="ul" :css="false" v-on:before-enter="lyricBeforeEnter"
					v-on:enter="lyricEnter" v-on:leave="lyricLeave">
					<li v-for="(item, index) in nowLyric"
						:style="{ 'opacity': LyricIndex == item.id ? '1' : '0.4', 'fontSize': LyricIndex == item.id ? '1.2em' : '1em', 'fontWeight': LyricIndex == item.id ? 'bold' : 'normal', 'color': LyricIndex == item.id ? '#532ab9' : themeMode ? 'white' : 'black' }"
						style="display:block;" v-bind:data-index="index" ref="lyric" :key="item.uid">
						{{ item.lyric }}
					</li>
				</transition-group>
			</div>
			<div class="progress" ref="progress">
				<div class="music_edit">
					<div class="music_edit__item" @click="showinputModal('modify')">
						<i class="fa-solid fa-pen"></i>
					</div>
					<div class="music_edit__item" @click="showModal = true">
						<i class="fa-solid fa-trash-can"></i>
					</div>
				</div>

				<div class="progress__top">
					<div class="album-info">
						<div class="album-info__name">
							{{
									Object.keys(currentTrack).length ? currentTrack.song_name == '' ? '未知曲名' : currentTrack.song_name : '未知曲名'
							}}
						</div>
						<div class="album-info__track">
							{{
									Object.keys(currentTrack).length ? currentTrack.composer == '' ? '未知作曲家' : currentTrack.composer : '未知作家'
							}}
						</div>
					</div>
					<div class="progress__duration">{{ duration ? duration : '00:00' }}</div>
				</div>
				<div class="progress__bar" @click="clickProgress">
					<div class="progress__current" :style="{ width: barWidth }"></div>
				</div>
				<div class="progress__time">{{ currentTime ? currentTime : '00:00' }}</div>
			</div>
			<div v-cloak></div>
		</div>
	</div>
	<Teleport to="body">
		<!-- 使用这个 modal 组件，传入 prop -->
		<modal :show="showModal" :songID="currentTrack.id" @close="showModal = false" @refreshInfo="getUserInfo()">
			<template #header>
				<h3>确定删除这首歌?</h3>
			</template>
			<template #body>
				<p>🎵{{ currentTrack.song_name }} - {{ currentTrack.composer }}🎵</p>
				<br>
				<p>有关于这首歌的信息将会被清除。</p>
			</template>
		</modal>
	</Teleport>

	<teleport to="body">
		<inputModal :show="showInputModal" @close="showInputModal = false" :inputData="InputModalData"
			@refreshInfo="getUserInfo()">
		</inputModal>
	</teleport>

</template>

<style>
@import url("../assets/css/index.css");
</style>
