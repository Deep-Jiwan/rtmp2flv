declare class NodePlayer {
  /**
   * 是否开启控制台调试信息输出
   * @param enable 开关
   */
  static debug(enable: boolean): void;

  /**
   * 回调形式的wasm异步加载
   * @param cb 回调函数
   */
  static load(cb: () => void): void;

  /**
   * async/await形式的wasm异步加载
   */
  static asyncLoad(): void;

  /**
   * 注册 active Audio Engine
   * @param enable 是否启用
   */
  static activeAudioEngine(enable: boolean): void;

  /**
   * 注册 worklet Audio Engine
   * 使用WebAudio的AudioWorkletAPI
   * 需要chrome内核66及以上,页面使用https加载,并播放https/wss流
   * @url https://caniuse.com/?search=audioworklet
   * @param enable 是否启用
   */
  static workletAudioEngine(enable: boolean): void;

  /**
   * 自动测试浏览器是否支持MSE硬件解码播放
   * 如不支持，仍然使用软解码。
   * 紧随 new 后调用，不调用则只使用软解。
   * @param drawOnCanvas 是否绘制到<canvas>上,false或者不传默认绘制到<video>上
   */
  useMSE(drawOnCanvas?: boolean): void;

  /**
   * 使用worker线程解码, 适用于多画面直播, 能有效利用多核处理器
   * 紧随 new 后调用
   * @param baseURL workerjs的基地址, 如果需要指定路径, 可传该参数, 必须以 / 结尾
   */
  useWorker(baseURL?: string): void;


  /**
   * 使用Chrome86及之后提供的WebCodecs API来进行硬解码.
   * 当前为实验特性,需要手动开启 
   * enable chrome://flags/#enable-experimental-web-platform-features, 
   * or pass --enable-blink-features=WebCodecs flag via the command line.
   */
  useWCS(): void;

  /**
   * 是否开启屏幕常亮
   * 在手机浏览器上,canvas标签渲染视频并不会像video标签那样保持屏幕常亮
   * 如果需要该功能, 可以调用此方法, 会有少量cpu消耗, pc浏览器不会执行
   */
  setKeepScreenOn(): void;

  /**
   * 绑定视图id
   * @param viewId canvas视图id
   * @param preserveDrawingBuffer WebGL的初始化参数preserveDrawingBuffer
   */
  setView(viewId: string, preserveDrawingBuffer: boolean): void;

  /**
   * 设置视频缩放模式
   * 当视频分辨率比例与canvas显示区域比例不同时,缩放效果不同:
   * 0 视频画面完全填充canvas区域,画面会被拉伸
   * 1 视频画面做等比缩放后,对齐canvas区域,画面不被拉伸,但有黑边
   * 2 视频画面做等比缩放后,完全填充canvas区域,画面不被拉伸,没有黑边,但画面显示不全
   * 注意：只在软解时有效
   * @param mode 缩放模式
   */
  setScaleMode(mode: number): void;

  /**
   * 视频放大
   * @param x  视频放大点 x
   * @param y  视频放大点 y
   * @param level 缩放等级,从 1.00 ~ 0.00, 1.0就是原始画面大小, 值越小越放大画面
   */
  setScaleLevel(x: number, y: number, level: number): void;

  /**
   * 画布放大,可以根据监听click事件获取到鼠标点击的画布坐标
   * @param x 画布放大点x
   * @param y 画布放大点y
   * @param level 缩放等级,从 1.00 ~ 0.00, 1.0就是原始画面大小, 值越小越放大画面
   */
  setCanvasScaleLevel(x: number, y: number, level: number): void;

  /**
   * 设置最大缓冲时长，单位毫秒
   * 当设置为0时,忽略音视频同步,收到数据即渲染.
   * @param bufferTime
   */
  setBufferTime(bufferTime: number): void;

  /**
   * 设置音量大小，取值0.0 — 1.0
   * 当为0.0时，完全无声
   * 当为1.0时，最大音量，默认值
   * @param volume 音量大小,浮点类型
   */
  setVolume(volume: number): void;

  /**
   * 设置超时时长, 单位秒,只在软解时有效
   * 在连接成功之前和播放中途,如果超过设定时长无数据返回,则回调timeout事件
   * @param time 超时时间, 单位秒
   */
  setTimeout(time: number): void;


  /**
   * 是否开启音频流处理
   * @param enable 是否开启
   */
  enableAudio(enable: boolean): void;

  /**
   * 是否开启视频流处理
   * @param enable 是否开启
   */
  enableVideo(enable: boolean): void;

  /**
   * 重置视图大小,将自动改变标签的高宽和css高宽
   * @param width 新视频区域宽
   * @param height 新视频区域高
   */
  resizeView(width: number, height: number): void;

  /**
   * 通知播放器画布尺寸改变，计算调整渲染尺寸
   * 也可以用于旋转画布
   * @param rotate 旋转角度
   * 可选0-默认，90，270
   */
  onResize(rotate?: number): void;

  /**
   * 截图
   * @param filename 截图后的文件名
   * @param format 截图的格式，可选png或jpeg
   * @param quality 可选参数，当格式是jpeg时，压缩质量，取值0.0 ~ 1.0
   */
  screenshot(filename: string, format: string, quality: number): void;

  /**
   * 开始播放
   * @param url http-flv,ws-flv 直播地址
   */
  start(url: string): void;

  /**
   * 停止播放
   */
  stop(): void;

  /**
   * 点播视频暂停播放
   * @param isPause 是否暂停
   */
  pause(isPause: boolean): void;

  /**
   * 全屏播放,iOS不支持
   */
  fullscreen(): void;

  /**
   * 恢复音频
   */
  audioResume(): void;

  /**
   * 获取当前音频状态
   * @return string 返回值为：closed, running, suspended
   */
  audioState(): string;

  /**
   * 清理画布为黑色背景
   * 用于canvas重用进行多个流切换播放时，将上一个画面清理
   * 避免后一个视频播放之前出现前一个视频最后一个画面
   * 在stop后调用
   */
  clearView(): void;

  /**
   * 跳过错误帧,尽可能的不显示因传输丢包造成的花屏\灰色\拖拉\半截不全的画面.
   * 只在软解时生效,跳过时画面会暂停.
   * 播放http-flv基于TCP,掉包会重传,只是延迟增加卡顿明显.
   * 出现上述画面多为推流端掉包,如udp-rtsp,udp-webrtc, 28181等
   * 当无法改善推流状况时,在播放端开启该方法能提升播体验.
   */
  skipErrorFrame(): void;

  /**
   * 释放播放器
   * @param loseContext 是否完全释放canvas上的WebGL context，默认不传为false。
   * loseContext 用于通过代码多次创建canvas ( document.createElement('canvas') )，
   * 可以传true来释放相应的GL context 避免出现 
   * Too many active WebGL contexts. Oldest context will be lost. 
   * 这样的警告
   */
  release(loseContext?: boolean): void;

  /**
   * 绑定事件监听器
   * @param event 事件
   * @param handler 处理器
   *
   * 'start'事件 当连接成功并收到数据
   * 'stop' 事件 当本地stop或远端断开连接
   * 'error'事件 当连接错误或播放中发生错误，error 一个参数
   * 'videoInfo'事件 当解析出视频信息时回调，width,height,codec 三个参数
   * 'videoSei' 事件 当解析出sei信息时回调，sei 一个参数
   * 'videoFrame' 事件 当渲染一帧视频时回调，pts 一个参数
   * 'audioInfo'事件 当解析出音频信息时回调，samplerate,channels,codec 三个参数
   * 'stats'事件 每秒回调一次，包含当前缓冲区时长，fps，音视频码率(bit)，stats(对象)一个参数
   * 'buffer'事件 empty,buffering,full 三种状态, state一个参数
   * 'timeout'事件 当设定的超时时间内无数据返回,则回调
   * 'click' 事件 当鼠标在画布内点击时回调, x,y 两个参数
   * 'audioState'事件, 当start()或audioResume()进行音频恢复时回调, (isRunning:boolean, state:string)两个参数
   */
  on(event: string, listener: (...args: any[]) => void): void;
}
