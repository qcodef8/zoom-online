// music-player.js

const MusicPlayer = {
    songs: [
        {
            title: "Đến Khi Nào",
            artist: "Khắc Việt",
            url: "https://tartqtwatyzbnledacen.supabase.co/storage/v1/object/public/day-28//den-khi-nao.mp3",
            cover: "https://photo-resize-zmp3.zmdcdn.me/w256_r1x1_jpeg/covers/8/7/877623bb22204d537f95e583739fd415_1380862393.jpg",
        },
        {
            title: "016 TanDu",
            artist: "Solsilva, Lil N",
            url: "https://tartqtwatyzbnledacen.supabase.co/storage/v1/object/public/day-28//tan-du.mp3",
            cover: "https://photo-resize-zmp3.zmdcdn.me/w256_r1x1_jpeg/cover/a/b/0/8/ab08b0a24988a83b38f52368af1a0c15.jpg",
        },
        {
            title: "Buồn Hay Vui",
            artist: "Vsoul",
            url: "https://tartqtwatyzbnledacen.supabase.co/storage/v1/object/public/day-28//buon-hay-vui.mp3",
            cover: "https://f.hoatieu.vn/data/image/2023/12/27/loi-bai-hat-buon-hay-vui-vsoul-700.jpg",
        },
    ],
    playlist: [],
    currentIndex: 0,
    isShuffle: false,
    isReplay: false,

    audioEl: document.querySelector("#audio"),
    titleEl: document.querySelector(".player-ui .title h3"),
    artistEl: document.querySelector(".player-ui .small p"),
    playBtnEl: document.querySelector(".controls i:nth-child(2)"),
    prevBtnEl: document.querySelector(".controls i:first-child"),
    nextBtnEl: document.querySelector(".controls i:last-child"),
    replayBtnEl: document.querySelector(".small i:first-child"),
    shuffleBtnEl: document.querySelector(".small i:last-child"),
    progressBarEl: document.querySelector(".progress"),
    playedBarEl: document.querySelector(".played"),
    coverEl: document.querySelector(".cover"),
    songEls: document.querySelectorAll(".music > div"),

    shuffleSongs(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    renderPlaylist() {
        const musicContainer = document.querySelector(".player .music");
        musicContainer.innerHTML = "";

        this.playlist.forEach((song, i) => {
            const songClass = `song-${i + 1}`;
            const imgClass = ["first", "second", "third", "fourth"][i] || "";
            const isPlaying = i === this.currentIndex && !this.audioEl.paused;

            const songDiv = document.createElement("div");
            songDiv.className = songClass;
            songDiv.innerHTML = `
                <div class="info">
                    <div class="img ${imgClass}" style="background-image: url('${
                song.cover
            }')"></div>
                    <div class="titles">
                        <h5>${song.title}</h5>
                        <p>${song.artist}</p>
                    </div>
                </div>
                <div class="state ${isPlaying ? "playing" : ""}">
                    <i class="material-symbols-outlined">${
                        isPlaying ? "equalizer" : "play_arrow"
                    }</i>
                </div>
            `;
            musicContainer.appendChild(songDiv);
        });

        this.songEls = document.querySelectorAll(".music > div");

        this.songEls.forEach((el, i) => {
            el.querySelector(".state i")?.addEventListener("click", () => {
                this.currentIndex = i;
                this.playCurrentSong();
            });
        });
    },

    loadSong(forceReload = true) {
        const song = this.playlist[this.currentIndex];

        if (forceReload) {
            this.audioEl.src = song.url;
        }

        this.titleEl.textContent = song.title;
        this.artistEl.textContent = song.artist;
        this.coverEl.style.background = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4)), url(${song.cover}) center bottom`;
        this.coverEl.style.backgroundSize = "cover";
        this.renderPlaylist();
    },

    togglePlayPause() {
        if (this.audioEl.paused) {
            this.audioEl
                .play()
                .then(() => {
                    this.playBtnEl.textContent = "pause";
                    this.renderPlaylist();
                })
                .catch((err) => console.warn("Play error:", err));
        } else {
            this.audioEl.pause();
            this.playBtnEl.textContent = "play_arrow";
            this.renderPlaylist();
        }
    },

    nextSong() {
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.playCurrentSong();
    },

    prevSong() {
        this.currentIndex =
            (this.currentIndex - 1 + this.playlist.length) %
            this.playlist.length;
        this.playCurrentSong();
    },

    playCurrentSong() {
        this.loadSong();
        this.audioEl.load();
        this.audioEl
            .play()
            .then(() => {
                this.playBtnEl.textContent = "pause";
                this.renderPlaylist();
            })
            .catch((err) => {
                console.warn("Playback failed:", err);
            });
    },

    updateProgress() {
        const percent =
            (this.audioEl.currentTime / this.audioEl.duration) * 100;
        this.playedBarEl.style.width = `${percent}%`;
    },

    bindEvents() {
        this.playBtnEl?.addEventListener("click", () => this.togglePlayPause());
        this.nextBtnEl?.addEventListener("click", () => this.nextSong());
        this.prevBtnEl?.addEventListener("click", () => this.prevSong());

        this.replayBtnEl?.addEventListener("click", () => {
            this.isReplay = !this.isReplay;
            this.replayBtnEl.style.color = this.isReplay ? "#f44336" : "white";
        });

        this.shuffleBtnEl?.addEventListener("click", () => {
            this.isShuffle = !this.isShuffle;
            this.shuffleBtnEl.style.color = this.isShuffle
                ? "#f44336"
                : "white";

            const wasPlaying = !this.audioEl.paused;
            const currentSong = this.playlist[this.currentIndex];
            const currentTime = this.audioEl.currentTime;

            if (this.isShuffle) {
                const remainingSongs = this.playlist.filter(
                    (_, i) => i !== this.currentIndex
                );
                const shuffled = this.shuffleSongs(remainingSongs);
                this.playlist = [currentSong, ...shuffled];
                this.currentIndex = 0;
            } else {
                this.playlist = [...this.songs];
                this.currentIndex = this.playlist.findIndex(
                    (s) => s.url === currentSong.url
                );
            }

            this.loadSong();

            this.audioEl.currentTime = currentTime;

            if (wasPlaying) {
                this.audioEl
                    .play()
                    .then(() => {
                        this.playBtnEl.textContent = "pause";
                        this.renderPlaylist();
                    })
                    .catch((err) => console.warn("Replay failed:", err));
            } else {
                this.playBtnEl.textContent = "play_arrow";
            }
        });

        this.progressBarEl?.addEventListener("click", (e) => {
            const rect = this.progressBarEl.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percent = clickX / rect.width;
            this.audioEl.currentTime = percent * this.audioEl.duration;
        });

        this.audioEl?.addEventListener("timeupdate", () =>
            this.updateProgress()
        );
        this.audioEl?.addEventListener("ended", () => {
            this.isReplay ? this.playCurrentSong() : this.nextSong();
        });
    },

    init() {
        this.playlist = [...this.songs];
        this.loadSong();
        this.bindEvents();
    },
};
