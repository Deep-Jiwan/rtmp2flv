// video player class to abstract player creation
class VideoPlayer {
    constructor(container, streamLink, options = {}) {
      this.container = container;
      // if a streamLink is not provided, it will be set after fetching the API links
      this.streamLink = streamLink || null;
      this.bufferTime = options.bufferTime || 100;
      this.LAG_THRESHOLD = options.lagThreshold || 3;
      this.isPlaying = false;
      this.lastStats = null;
      this.player = null;
      this._createPlayerElements();
      this._initPlayer();
      // Fetch and load the links into the integrated drop down
      this._loadLinks();
    }
  
    // Inserts the HTML structure for the player into the container with unique IDs and fixed classes
    _createPlayerElements() {
      const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
      this.uniqueId = uniqueId;
      this.container.innerHTML = `
        <div id="videoContainer-${uniqueId}" class="videoContainer relative w-full aspect-video rounded-[10px] shadow-2xl">
          <canvas id="videoCanvas-${uniqueId}" width="1920" height="1080" class="videoCanvas absolute inset-0 w-full h-full bg-black rounded-[10px]"></canvas>
          <!-- Central play button -->
          <button id="centerPlayButton-${uniqueId}" class="centerPlayButton">
            <svg class="w-12 h-12" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 4l12 6-12 6V4z"/>
            </svg>
          </button>
          <!-- Bottom left play/pause button -->
          <button id="bottomLeftButton-${uniqueId}" class="bottomLeftButton">
            <svg id="bottomLeftIcon-${uniqueId}" class="bottomLeftIcon w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 4l12 6-12 6V4z"/>
            </svg>
          </button>
          <!-- Custom controls container -->
          <div id="customControls-${uniqueId}" class="customControls absolute bottom-4 right-4 flex items-center gap-4 transition-opacity duration-300 opacity-0">
            <button id="muteBtn-${uniqueId}" class="muteBtn bg-black bg-opacity-70 p-3 rounded-full">
              <svg id="muteIcon-${uniqueId}" class="muteIcon w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 5.82V2L3 8l6 6v-3.82l4.18 4.18L15 14l-5-5 5-5-1.82-1.82L9 5.82z"/>
              </svg>
            </button>
            <div id="volumeControl-${uniqueId}" class="volumeControl relative flex items-center">
              <button id="volumeBtn-${uniqueId}" class="volumeBtn bg-black bg-opacity-70 p-3 rounded-full">
                <svg id="volumeIcon-${uniqueId}" class="volumeIcon w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 8v4h4l5 5V3l-5 5H3z"/>
                </svg>
              </button>
              <div id="volumeSliderContainer-${uniqueId}" class="volume-slider-container volumeSliderContainer flex items-center">
                <input id="volumeSlider-${uniqueId}" type="range" min="0" max="1" step="0.05" value="0.5" class="horizontal-slider volumeSlider">
              </div>
            </div>
            <button id="fullscreenBtn-${uniqueId}" class="fullscreenBtn bg-black bg-opacity-70 p-3 rounded-full">
              <svg class="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4h6v2H6v4H4V4zm12 0v6h-2V6h-4V4h6zm0 12h-6v-2h4v-4h2v6zm-12 0v-6h2v4h4v2H4z"/>
              </svg>
            </button>
          </div>
          <!-- Integrated drop down for stream links -->
          <div id="linkSelectorContainer-${uniqueId}" class="linkSelectorContainer absolute top-4 left-4 z-20">
            <select id="linkSelector-${uniqueId}" class="selectorItem">
              <!-- Options will be populated dynamically -->
            </select>
          </div>
        </div>
      `;
      // Cache element references using the unique IDs
      this.videoContainer = this.container.querySelector(`#videoContainer-${uniqueId}`);
      this.canvas = this.container.querySelector(`#videoCanvas-${uniqueId}`);
      this.centerPlayButton = this.container.querySelector(`#centerPlayButton-${uniqueId}`);
      this.bottomLeftButton = this.container.querySelector(`#bottomLeftButton-${uniqueId}`);
      this.bottomLeftIcon = this.container.querySelector(`#bottomLeftIcon-${uniqueId}`);
      this.customControls = this.container.querySelector(`#customControls-${uniqueId}`);
      this.muteBtn = this.container.querySelector(`#muteBtn-${uniqueId}`);
      this.muteIcon = this.container.querySelector(`#muteIcon-${uniqueId}`);
      this.volumeControl = this.container.querySelector(`#volumeControl-${uniqueId}`);
      this.volumeSliderContainer = this.container.querySelector(`#volumeSliderContainer-${uniqueId}`);
      this.volumeSlider = this.container.querySelector(`#volumeSlider-${uniqueId}`);
      this.fullscreenBtn = this.container.querySelector(`#fullscreenBtn-${uniqueId}`);
      // Drop down elements
      this.linkSelectorContainer = this.container.querySelector(`#linkSelectorContainer-${uniqueId}`);
      this.linkSelector = this.container.querySelector(`#linkSelector-${uniqueId}`);
    }
  
    // Initializes NodePlayer and sets up event listeners
    _initPlayer() {
      NodePlayer.load(() => {
        this.player = new NodePlayer();
        this.player.setKeepScreenOn();
        // If streamLink is set (via API or provided), assign it; otherwise, _loadLinks() will set it.
        if (this.streamLink) {
          this.player.setView(this.canvas.id);
          this.player.setBufferTime(this.bufferTime);
        }
        this._attachPlayerEvents();
        this._attachUIEvents();
      });
    }
  
    _loadLinks() {
      // Fetch the links from your backend API endpoint
      fetch('/api/links')
        .then(response => response.json())
        .then(data => {
          // Expecting data in the form { "links": [ "link1", "link2", ... ] }
          const links = data.links;
          if (!links || links.length === 0) {
            console.error("No links received from API.");
            return;
          }
          // Populate the drop down with options
          links.forEach((link, index) => {
            const option = document.createElement('option');
            option.value = link;
            option.text = `Stream ${index + 1}`;
            this.linkSelector.appendChild(option);
          });
          // Set the default link if not already provided
          if (!this.streamLink) {
            this.streamLink = links[0];
            // Also update the drop down to show the first option as selected
            this.linkSelector.selectedIndex = 0;
          }
          // Now that the link is available, update NodePlayer view (if not already initialized)
          if (this.player) {
            this.player.setView(this.canvas.id);
            this.player.setBufferTime(this.bufferTime);
          }
        })
        .catch(error => console.error("Failed to fetch links:", error));
  
      // Listen for changes in the drop down
      this.linkSelector.addEventListener('change', (e) => {
        const selectedLink = e.target.value;
        // If playing, stop the current stream and show the play button
        if (this.isPlaying) {
          this.player.stop();
          this.isPlaying = false;
        }
        // Update the stream link and reveal the central play button
        this.streamLink = selectedLink;
        this.centerPlayButton.style.display = "block";
        this.centerPlayButton.style.opacity = "1";
      });
    }
  
    _attachPlayerEvents() {
      this.player.on("start", () => console.log("Player started"));
      this.player.on("stop", () => console.log("Player stopped"));
      this.player.on("error", (e) => console.error("Player error:", e));
      this.player.on("videoInfo", (w, h, codec) => console.log("Video info:", w, h, codec));
      this.player.on("audioInfo", (r, c, codec) => console.log("Audio info:", r, c, codec));
      this.player.on("stats", (stats) => {
        this.lastStats = stats;
      });

      // funciton to restart the stream if a timeout occurs
      setInterval(() => {
        if (this.isPlaying && this.lastStats && typeof this.lastStats.liveDelay === 'number') {
          if (this.lastStats.liveDelay > this.LAG_THRESHOLD) {
            console.log("Lag detected. Restarting playback...");
            this.player.stop();
            this.player.start(this.streamLink);
          }
        }
      }, 5000);
    }
  
    _attachUIEvents() {
      // Central play button starts the stream
      this.centerPlayButton.addEventListener("click", () => {
        if (this.streamLink) {
          this.player.start(this.streamLink);
          this.isPlaying = true;
          this.bottomLeftIcon.innerHTML = '<path d="M5 4h4v12H5zM11 4h4v12h-4z" />';
          this.centerPlayButton.style.opacity = "0";
          setTimeout(() => { this.centerPlayButton.style.display = "none"; }, 300);
        } else {
          console.warn("Stream link not provided.");
        }
      });
  
      // Bottom left button toggles play/pause
      this.bottomLeftButton.addEventListener("click", () => {
        if (this.isPlaying) {
          this.player.stop();
          this.isPlaying = false;
          this.bottomLeftIcon.innerHTML = '<path d="M6 4l12 6-12 6V4z"/>';
          this.centerPlayButton.style.display = "block";
          setTimeout(() => { this.centerPlayButton.style.opacity = "1"; }, 10);
        } else {
          if (this.streamLink) {
            this.player.start(this.streamLink);
            this.isPlaying = true;
            this.bottomLeftIcon.innerHTML = '<path d="M5 4h4v12H5zM11 4h4v12h-4z" />';
            this.centerPlayButton.style.display = "none";
          } else {
            console.warn("Stream link not provided.");
          }
        }
      });
  
      // Volume slider expand on hover
      this.volumeControl.addEventListener("mouseenter", () => {
        this.volumeSliderContainer.classList.add("expanded");
      });
      this.volumeControl.addEventListener("mouseleave", () => {
        this.volumeSliderContainer.classList.remove("expanded");
      });
  
      // Mute button logic
      let isMuted = false, lastVolume = 0.5;
      this.muteBtn.addEventListener("click", () => {
        isMuted = !isMuted;
        if (isMuted) {
          lastVolume = this.volumeSlider.value;
          this.player.setVolume(0);
          this.muteIcon.innerHTML = '<path d="M10 8.586l-2.293-2.293-1.414 1.414L8.586 10l-2.293 2.293 1.414 1.414L10 11.414l2.293 2.293 1.414-1.414L11.414 10l2.293-2.293-1.414-1.414L10 8.586z"/>';
        } else {
          this.player.setVolume(lastVolume);
          this.muteIcon.innerHTML = '<path d="M9 5.82V2L3 8l6 6v-3.82l4.18 4.18L15 14l-5-5 5-5-1.82-1.82L9 5.82z"/>';
        }
      });
      // Update volume when slider is used
      this.volumeSlider.addEventListener("input", (e) => {
        this.player.setVolume(e.target.value);
        if (parseFloat(e.target.value) > 0) {
          isMuted = false;
          this.muteIcon.innerHTML = '<path d="M9 5.82V2L3 8l6 6v-3.82l4.18 4.18L15 14l-5-5 5-5-1.82-1.82L9 5.82z"/>';
        }
      });
      // Fullscreen toggle
      this.fullscreenBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
          this.videoContainer.requestFullscreen().catch(err => console.error(err));
        } else {
          document.exitFullscreen();
        }
      });
      // Show/hide custom controls on hover
      this.videoContainer.addEventListener("mouseenter", () => {
        this.customControls.classList.remove("opacity-0");
        this.customControls.classList.add("opacity-100");
        if (this.isPlaying) this.bottomLeftButton.style.opacity = "1";
      });
      this.videoContainer.addEventListener("mouseleave", () => {
        this.customControls.classList.remove("opacity-100");
        this.customControls.classList.add("opacity-0");
        this.bottomLeftButton.style.opacity = "0";
      });
    }
  }
  
  // Helper function to spawn a video player in the specified container
  function spawnVideoPlayer(containerSelector, streamLink, options = {}) {
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.error("Container element not found:", containerSelector);
      return;
    }
    return new VideoPlayer(container, streamLink, options);
  }
  