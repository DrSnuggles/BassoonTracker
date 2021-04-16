var BassoonTracker = (function(){
;
/*
 Bridges Host functions BassoonTracker is running in.
 Currently supports
 	Web
 	WebPlugin
 	FriendUp
*/

var Host = function(){
	var me = {};
	var hostBridge;
	
	me.$f = true;
	me.useDropbox = true;
	me.showInternalMenu = true;
	me.useWebWorkers = true;
	me.useInitialLoad = true;
	
	me.init = function(){
	    if (typeof HostBridge === "object"){
			hostBridge = HostBridge;
			hostBridge.init();

			if (typeof hostBridge.$f === "boolean") me.$f = hostBridge.$f;
			if (typeof hostBridge.useDropbox === "boolean") me.useDropbox = hostBridge.useDropboxs;
			if (typeof hostBridge.showInternalMenu === "boolean") me.showInternalMenu = hostBridge.showInternalMenu;
			if (typeof hostBridge.useWebWorkers === "boolean") me.useWebWorkers = hostBridge.useWebWorkers;
	    }
	};
	
	me.getBaseUrl = function(){
		if (hostBridge && hostBridge.getBaseUrl){
			return hostBridge.getBaseUrl();
		}
		
		// Settings.baseUrl ... hmm ... can't remember where that is coming from
		if (typeof Settings === "undefined"){
			return "";
		}else{
			return Settings.baseUrl || "";
		}
	};
	
	me.getRemoteUrl = function(){
		if (hostBridge && hostBridge.getRemoteUrl){
			return hostBridge.getRemoteUrl();
		}
		return "";
	};
	
	me.getVersionNumber = function(){
		if (typeof versionNumber !== "undefined") return versionNumber;
		if (hostBridge && hostBridge.getVersionNumber) 	return hostBridge.getVersionNumber();
		return "dev";
	};
	
	me.getBuildNumber = function(){
		if (typeof buildNumber !== "undefined") return buildNumber;
		if (hostBridge && hostBridge.getBuildNumber) return hostBridge.getBuildNumber();
		return new Date().getTime();
	};

	me.signalReady = function(){
		if (hostBridge && hostBridge.signalReady) hostBridge.signalReady();
	};
	
	me.putFile = function(file_a,file){
		
	};
	
	return me;
}();;
var cachedAssets = {
	images:{},
	audio:{},
	json:{},
	arrayBuffer:{}
};

var sprites = {};
var UI = undefined;

var PRELOADTYPE = {
	"image": 1,
	"audio":2,
	"json":3,
	"binary":4
};

var EVENT = {
	_uChange:1,
	patternChange:2,
	patternPosChange:3,
	patternTableChange:4,
	recordingChange:5,
	cursorPositionChange:6,
	trackStateChange:7,
	playingChange:8,
	playTypeChange: 9,
	songPositionChange:10,
	songSpeedChange:11,
	songBPMChange:12,
	samplePlay:13,
	screenRefresh: 14,
    screenRender: 15,
	songPropertyChange: 16,
	_uNameChange:17,
	command: 18,
	pianoNoteOn : 19,
	pianoNoteOff : 20,
	statusChange: 21,
	diskOperationTargetChange: 22,
	diskOperationActionChange: 23,
	trackCountChange:24,
	patternHorizontalScrollChange:25,
	songLoaded: 26,
	songLoading: 27,
	trackerModeChanged: 28,
    _uListChange:29,
	showView: 30,
	toggleView: 31,
	visibleTracksCountChange:32,
    filterChainCountChange:33,
    fxPanelToggle:34,
	samplePropertyChange:35,
	sampleIndexChange:36,
	second:37,
	minute:38,
	dropboxConnect: 39,
	dropboxConnectCancel: 40,
	trackScopeClick: 41,
	octaveChanged: 42,
	skipFrameChanged: 43,
	showContextMenu: 44,
	hideContextMenu: 45,
	clockEventExpired: 46,
	commandUndo: 50,
	commandRedo: 51,
	commandSelectAll: 52,
	songEnd: 53,
	patternEnd: 54,
	songSpeedChangeIgnored:55,
	songBPMChangeIgnored:56,
	commandProcessSample: 57,
	pluginRenderHook: 58,
	menuLayoutChanged: 59,
	midiIn: 60
};

var COMMAND = {
	newFile: 1,
	openFile: 2,
	saveFile: 3,
	clearTrack : 4,
	clearPattern : 5,
	clearSong : 6,
	$a : 7,
	showMain : 8,
	showOptions : 9,
	showFileOperations : 10,
	showSampleEditor : 11,
	showAbout : 12,
	showHelp : 13,
	togglePiano : 14,
	showTopMain : 15,
	showBottomMain: 16,
	randomSong: 17,
    randomSongXM: 18,
	showGithub: 19,
	showStats: 20,
	cut: 21,
	copy: 22,
	paste: 23,
	pattern2Sample: 24,
	toggleAppSideBar: 25,
	undo: 26,
	redo: 27,
	nibbles: 28
};

var PLAYTYPE = {
	song:1,
	pattern:2
};

var FILETYPE = {
	module:1,
	sample:2,
	pattern:3,
	track: 4
};

var MODULETYPE = {
	mod: 1,
	xm: 2
};

var SAMPLETYPE = {
    RAW_8BIT:1,
    WAVE_PCM:2,
    IFF_8SVX:3,
    MP3:4,
	RIFF_8BIT: 5,
	RIFF_16BIT: 6
};

var STEREOSEPARATION = {
	FULL: 1,
	BALANCED: 2,
	NONE: 3
};

var FREQUENCYTABLE =  {
	AMIGA: 1,
	LINEAR : 2
};

var LOOPTYPE =  {
	NONE: 0,
	FORWARD : 1,
	PINGPONG : 2
};

var SELECTION = {
	RESET : 1,
	CLEAR: 2,
	CUT: 3,
	COPY : 4,
	PASTE : 5,
	POSITION: 6,
	DELETE: 7,
	REPLACE: 8

};

var EDITACTION = {
	PATTERN: 1,
	TRACK: 2,
	NOTE: 3,
	RANGE: 4,
	VALUE: 5,
	DATA: 6,
	SAMPLE: 7
};


// Amiga Frequency
//var PALFREQUENCY = 7093789.2;
var AMIGA_PALFREQUENCY = 7093790; // not that my ears can hear the difference but this seems to be the correct value  ftp://ftp.modland.com/pub/documents/format_documentation/Protracker%20effects%20(MODFIL12.TXT)%20(.mod).txt

// Frequency used by Fast Tracker in Amiga mode
var PC_FREQUENCY = 7158728;

var AMIGA_PALFREQUENCY_HALF = AMIGA_PALFREQUENCY/2;
var PC_FREQUENCY_HALF = PC_FREQUENCY/2;

var LAYOUTS = {
	column4:4,
	column5:5,
	column5Full:6,
	column6:7
};



// used in Protracker mode
var NOTEPERIOD = {
	C1  : {_b: 856, _a: "C-1", tune: [907,900,894,887,881,875,868,862,856,850,844,838,832,826,820,814]},
	Cs1 : {_b: 808, _a: "C#1", tune: [856,850,844,838,832,826,820,814,808,802,796,791,785,779,774,768]},
	D1  : {_b: 762, _a: "D-1", tune: [808,802,796,791,785,779,774,768,762,757,752,746,741,736,730,725]},
	Ds1 : {_b: 720, _a: "D#1", tune: [762,757,752,746,741,736,730,725,720,715,709,704,699,694,689,684]},
	E1  : {_b: 678, _a: "E-1", tune: [720,715,709,704,699,694,689,684,678,674,670,665,660,655,651,646]},
	F1  : {_b: 640, _a: "F-1", tune: [678,675,670,665,660,655,651,646,640,637,632,628,623,619,614,610]},
	Fs1 : {_b: 604, _a: "F#1", tune: [640,636,632,628,623,619,614,610,604,601,597,592,588,584,580,575]},
	G1  : {_b: 570, _a: "G-1", tune: [604,601,597,592,588,584,580,575,570,567,563,559,555,551,547,543]},
	Gs1 : {_b: 538, _a: "G#1", tune: [570,567,563,559,555,551,547,543,538,535,532,528,524,520,516,513]},
	A1  : {_b: 508, _a: "A-1", tune: [538,535,532,528,524,520,516,513,508,505,502,498,495,491,487,484]},
	As1 : {_b: 480, _a: "A#1", tune: [508,505,502,498,494,491,487,484,480,477,474,470,467,463,460,457]},
	B1  : {_b: 453, _a: "B-1", tune: [480,477,474,470,467,463,460,457,453,450,447,444,441,437,434,431]},
	C2  : {_b: 428, _a: "C-2", tune: [453,450,447,444,441,437,434,431,428,425,422,419,416,413,410,407]},
	Cs2 : {_b: 404, _a: "C#2", tune: [428,425,422,419,416,413,410,407,404,401,398,395,392,390,387,384]},
	D2  : {_b: 381, _a: "D-2", tune: [404,401,398,395,392,390,387,384,381,379,376,373,370,368,365,363]},
	Ds2 : {_b: 360, _a: "D#2", tune: [381,379,376,373,370,368,365,363,360,357,355,352,350,347,345,342]},
	E2  : {_b: 339, _a: "E-2", tune: [360,357,355,352,350,347,345,342,339,337,335,332,330,328,325,323]},
	F2  : {_b: 320, _a: "F-2", tune: [339,337,335,332,330,328,325,323,320,318,316,314,312,309,307,305]},
	Fs2 : {_b: 302, _a: "F#2", tune: [320,318,316,314,312,309,307,305,302,300,298,296,294,292,290,288]},
	G2  : {_b: 285, _a: "G-2", tune: [302,300,298,296,294,292,290,288,285,284,282,280,278,276,274,272]},
	Gs2 : {_b: 269, _a: "G#2", tune: [285,284,282,280,278,276,274,272,269,268,266,264,262,260,258,256]},
	A2  : {_b: 254, _a: "A-2", tune: [269,268,266,264,262,260,258,256,254,253,251,249,247,245,244,242]},
	As2 : {_b: 240, _a: "A#2", tune: [254,253,251,249,247,245,244,242,240,239,237,235,233,232,230,228]},
	B2  : {_b: 226, _a: "B-2", tune: [240,238,237,235,233,232,230,228,226,225,224,222,220,219,217,216]},
	C3  : {_b: 214, _a: "C-3", tune: [226,225,223,222,220,219,217,216,214,213,211,209,208,206,205,204]},
	Cs3 : {_b: 202, _a: "C#3", tune: [214,212,211,209,208,206,205,203,202,201,199,198,196,195,193,192]},
	D3  : {_b: 190, _a: "D-3", tune: [202,200,199,198,196,195,193,192,190,189,188,187,185,184,183,181]},
	Ds3 : {_b: 180, _a: "D#3", tune: [190,189,188,187,185,184,183,181,180,179,177,176,175,174,172,171]},
	E3  : {_b: 170, _a: "E-3", tune: [180,179,177,176,175,174,172,171,170,169,167,166,165,164,163,161]},
	F3  : {_b: 160, _a: "F-3", tune: [170,169,167,166,165,164,163,161,160,159,158,157,156,155,154,152]},
	Fs3 : {_b: 151, _a: "F#3", tune: [160,159,158,157,156,155,154,152,151,150,149,148,147,146,145,144]},
	G3  : {_b: 143, _a: "G-3", tune: [151,150,149,148,147,146,145,144,143,142,141,140,139,138,137,136]},
	Gs3 : {_b: 135, _a: "G#3", tune: [143,142,141,140,139,138,137,136,135,134,133,132,131,130,129,128]},
	A3  : {_b: 127, _a: "A-3", tune: [135,134,133,132,131,130,129,128,127,126,125,125,124,123,122,121]},
	As3 : {_b: 120, _a: "A#3", tune: [127,126,125,125,123,123,122,121,120,119,118,118,117,116,115,114]},
	B3  : {_b: 113, _a: "B-3", tune: [120,119,118,118,117,116,115,114,113,113,112,111,110,109,109,108]}
};

// used in Fasttracker - Amiga frequency mode
var FTNOTEPERIOD = {
	None  : {_a: "---"},
	C0: {_a: "C-0",_b: 6848},
	Cs0: {_a: "C#0",_b: 6464},
	D0: {_a: "D-0",_b: 6096},
	Ds0: {_a: "D#0",_b: 5760},
	E0: {_a: "E-0",_b: 5424},
	F0: {_a: "F-0",_b: 5120},
	Fs0: {_a: "F#0",_b: 4832},
	G0: {_a: "G-0",_b: 4560},
	Gs0: {_a: "G#0",_b: 4304},
	A0: {_a: "A-0",_b: 4064},
	As0: {_a: "A#0",_b: 3840},
	B0: {_a: "B-0",_b: 3624},
	C1: {_a: "C-1",_b: 3424},
	Cs1: {_a: "C#1",_b: 3232},
	D1: {_a: "D-1",_b: 3048},
	Ds1: {_a: "D#1",_b: 2880},
	E1: {_a: "E-1",_b: 2712},
	F1: {_a: "F-1",_b: 2560},
	Fs1: {_a: "F#1",_b: 2416},
	G1: {_a: "G-1",_b: 2280},
	Gs1: {_a: "G#1",_b: 2152},
	A1: {_a: "A-1",_b: 2032},
	As1: {_a: "A#1",_b: 1920},
	B1: {_a: "B-1",_b: 1812},
	C2: {_a: "C-2",_b: 1712},
	Cs2: {_a: "C#2",_b: 1616},
	D2: {_a: "D-2",_b: 1524},
	Ds2: {_a: "D#2",_b: 1440},
	E2: {_a: "E-2",_b: 1356},
	F2: {_a: "F-2",_b: 1280},
	Fs2: {_a: "F#2",_b: 1208},
	G2: {_a: "G-2",_b: 1140},
	Gs2: {_a: "G#2",_b: 1076},
	A2: {_a: "A-2",_b: 1016},
	As2: {_a: "A#2",_b: 960},
	B2: {_a: "B-2",_b: 906},
	C3: {_a: "C-3",_b: 856},
	Cs3: {_a: "C#3",_b: 808},
	D3: {_a: "D-3",_b: 762},
	Ds3: {_a: "D#3",_b: 720},
	E3: {_a: "E-3",_b: 678},
	F3: {_a: "F-3",_b: 640},
	Fs3: {_a: "F#3",_b: 604},
	G3: {_a: "G-3",_b: 570},
	Gs3: {_a: "G#3",_b: 538},
	A3: {_a: "A-3",_b: 508},
	As3: {_a: "A#3",_b: 480},
	B3: {_a: "B-3",_b: 453},
	C4: {_a: "C-4",_b: 428},
	Cs4: {_a: "C#4",_b: 404},
	D4: {_a: "D-4",_b: 381},
	Ds4: {_a: "D#4",_b: 360},
	E4: {_a: "E-4",_b: 339},
	F4: {_a: "F-4",_b: 320},
	Fs4: {_a: "F#4",_b: 302},
	G4: {_a: "G-4",_b: 285},
	Gs4: {_a: "G#4",_b: 269},
	A4: {_a: "A-4",_b: 254},
	As4: {_a: "A#4",_b: 240},
	B4: {_a: "B-4",_b: 226.5,_k: 226},
	C5: {_a: "C-5",_b: 214},
	Cs5: {_a: "C#5",_b: 202},
	D5: {_a: "D-5",_b: 190.5,_k: 190},
	Ds5: {_a: "D#5",_b: 180},
	E5: {_a: "E-5",_b: 169.5,_k: 170},
	F5: {_a: "F-5",_b: 160},
	Fs5: {_a: "F#5",_b: 151},
	G5: {_a: "G-5",_b: 142.5,_k: 143},
	Gs5: {_a: "G#5",_b: 134.5,_k: 135},
	A5: {_a: "A-5",_b: 127},
	As5: {_a: "A#5",_b: 120},
	B5: {_a: "B-5",_b: 113.25,_k: 113},
	C6: {_a: "C-6",_b: 107},
	Cs6: {_a: "C#6",_b: 101},
	D6: {_a: "D-6",_b: 95.25,_k: 95},
	Ds6: {_a: "D#6",_b: 90},
	E6: {_a: "E-6",_b: 84.75,_k: 85},
	F6: {_a: "F-6",_b: 80},
	Fs6: {_a: "F#6",_b: 75.5,_k: 75},
	G6: {_a: "G-6",_b: 71.25,_k: 71},
	Gs6: {_a: "G#6",_b: 67.25,_k: 67},
	A6: {_a: "A-6",_b: 63.5,_k: 63},
	As6: {_a: "A#6",_b: 60},
	B6: {_a: "B-6",_b: 56.625,_k: 56},
	C7: {_a: "C-7",_b: 53.5,_k: 53},
	Cs7: {_a: "C#7",_b: 50.5,_k: 50},
	D7: {_a: "D-7",_b: 47.625,_k: 47},
	Ds7: {_a: "D#7",_b: 45},
	E7: {_a: "E-7",_b: 42.375,_k: 42},
	F7: {_a: "F-7",_b: 40},
	Fs7: {_a: "F#7",_b: 37.75,_k: 37},
	G7: {_a: "G-7",_b: 35.625,_k: 35},
	Gs7: {_a: "G#7",_b: 33.625,_k: 33},
	A7: {_a: "A-7",_b: 31.75,_k: 31},
	As7: {_a: "A#7",_b: 30},
	B7: {_a: "B-7",_b: 28.3125,_k: 28},


	// not used in fileformat but can be played through transposed notes
	C8: {_a: "C-8",_b: 26.75},
	Cs8: {_a: "C#8",_b: 25.25},
	D8: {_a: "D-8",_b: 23.8125},
	Ds8: {_a: "D#8",_b: 22.5},
	E8: {_a: "E-8",_b: 21.1875},
	F8: {_a: "F-8",_b: 20},
	Fs8: {_a: "F#8",_b: 18.875},
	G8: {_a: "G-8",_b: 17.8125},
	Gs8: {_a: "G#8",_b: 16.8125},
	A8: {_a: "A-8",_b: 15.875},
	As8: {_a: "A#8",_b: 15},
	B8: {_a: "B-8",_b: 14.15625},
	C9: {_a: "C-9",_b: 13.375},
	Cs9: {_a: "C#9",_b: 12.625},
	D9: {_a: "D-9",_b: 11.90625},
	Ds9: {_a: "D#9",_b: 11.25},
	E9: {_a: "E-9",_b: 10.59375},
	F9: {_a: "F-9",_b: 10},
	Fs9: {_a: "F#9",_b: 9.4375},
	G9: {_a: "G-9",_b: 8.90625},
	Gs9: {_a: "G#9",_b: 8.40625},
	A9: {_a: "A-9",_b: 7.9375},
	As9: {_a: "A#9",_b: 7.5},
	B9: {_a: "B-9",_b: 7.078125},
	C10: {_a: "C-10",_b: 6.6875},
	Cs10: {_a: "C#10",_b: 6.3125},
	D10: {_a: "D-10",_b: 5.953125},
	Ds10: {_a: "D#10",_b: 5.625},
	E10: {_a: "E-10",_b: 5.296875},
	F10: {_a: "F-10",_b: 5},
	Fs10: {_a: "F#10",_b: 4.71875},
	G10: {_a: "G-10",_b: 4.453125},
	Gs10: {_a: "G#10",_b: 4.203125},
	A10: {_a: "A-10",_b: 3.96875},
	As10: {_a: "A#10",_b: 3.75},
	B10: {_a: "B-10",_b: 3.5390625},
	C11: {_a: "C-11",_b: 3.34375},
	Cs11: {_a: "C#11",_b: 3.15625},
	D11: {_a: "D-11",_b: 2.9765625},
	Ds11: {_a: "D#11",_b: 2.8125},
	E11: {_a: "E-11",_b: 2.6484375},
	F11: {_a: "F-11",_b: 2.5},
	Fs11: {_a: "F#11",_b: 2.359375},
	G11: {_a: "G-11",_b: 2.2265625},
	Gs11: {_a: "G#11",_b: 2.1015625},
	A11: {_a: "A-11",_b: 1.984375},
	As11: {_a: "A#11",_b: 1.875},
	B11: {_a: "B-11",_b: 1.76953125},

	OFF : {_a: "OFF",_b:0}
};

var NOTEOFF = 145;

var KEYBOARDKEYS = {
    OFF: 0,
	C: 1,
	Csharp: 2,
	D: 3,
	Dsharp: 4,
	E: 5,
	F: 6,
	Fsharp: 7,
	G: 8,
	Gsharp: 9,
	A: 10,
	Asharp: 11,
	B: 12,
	COctaveUp: 13,
	CsharpOctaveUp: 14,
	DOctaveUp: 15,
	DsharpOctaveUp: 16,
	EOctaveUp: 17,
	FOctaveUp: 18,
	FsharpOctaveUp: 19,
	GOctaveUp: 20,
	GsharpOctaveUp: 21,
	AOctaveUp: 22,
	AsharpOctaveUp: 23,
	BOctaveUp: 24,
	COctaveUp2: 25,
	CsharpOctaveUp2: 26,
	DOctaveUp2: 27
};

var OCTAVENOTES = {
    0: {_a: "OFF"},
	1: {_a: "C"},
	2: {_a: "Cs"},
    3: {_a: "D"},
    4: {_a: "Ds"},
    5: {_a: "E"},
    6: {_a: "F"},
	7: {_a: "Fs"},
    8: {_a: "G"},
    9: {_a: "Gs"},
    10: {_a: "A"},
    11: {_a: "As"},
    12: {_a: "B"}
};


var KEYBOARDTABLE = {
	azerty:{
		a: KEYBOARDKEYS.COctaveUp,
		z: KEYBOARDKEYS.DOctaveUp,
		e: KEYBOARDKEYS.EOctaveUp,
		r: KEYBOARDKEYS.FOctaveUp,
		t: KEYBOARDKEYS.GOctaveUp,
		y: KEYBOARDKEYS.AOctaveUp,
		u: KEYBOARDKEYS.BOctaveUp,
		i: KEYBOARDKEYS.COctaveUp2,
		o: KEYBOARDKEYS.DOctaveUp2,

		"é": KEYBOARDKEYS.CsharpOctaveUp,
		'"': KEYBOARDKEYS.DsharpOctaveUp,
		"(": KEYBOARDKEYS.FsharpOctaveUp,
		"§": KEYBOARDKEYS.GsharpOctaveUp,
		"è": KEYBOARDKEYS.AsharpOctaveUp,
		"ç": KEYBOARDKEYS.CsharpOctaveUp2,

		w: KEYBOARDKEYS.C,
		x: KEYBOARDKEYS.D,
		c: KEYBOARDKEYS.E,
		v: KEYBOARDKEYS.F,
		b: KEYBOARDKEYS.G,
		n: KEYBOARDKEYS.A,
		",": KEYBOARDKEYS.B,
		";": KEYBOARDKEYS.COctaveUp,
		":": KEYBOARDKEYS.DOctaveUp,

		s: KEYBOARDKEYS.Csharp,
		d: KEYBOARDKEYS.Dsharp,
		g: KEYBOARDKEYS.Fsharp,
		h: KEYBOARDKEYS.Gsharp,
		j: KEYBOARDKEYS.Asharp,

		"<": KEYBOARDKEYS.OFF
	},
	dvorak:{
		"\'": KEYBOARDKEYS.COctaveUp,
		',': KEYBOARDKEYS.DOctaveUp,
		'.': KEYBOARDKEYS.EOctaveUp,
		p: KEYBOARDKEYS.FOctaveUp,
		y: KEYBOARDKEYS.GOctaveUp,
		f: KEYBOARDKEYS.AOctaveUp,
		g: KEYBOARDKEYS.BOctaveUp,
		c: KEYBOARDKEYS.COctaveUp2,
		r: KEYBOARDKEYS.DOctaveUp2,

		"2": KEYBOARDKEYS.CsharpOctaveUp,
		'3': KEYBOARDKEYS.DsharpOctaveUp,
		"5": KEYBOARDKEYS.FsharpOctaveUp,
		"6": KEYBOARDKEYS.GsharpOctaveUp,
		"7": KEYBOARDKEYS.AsharpOctaveUp,
		"9": KEYBOARDKEYS.CsharpOctaveUp2,

		';': KEYBOARDKEYS.C,
		q: KEYBOARDKEYS.D,
		j: KEYBOARDKEYS.E,
		k: KEYBOARDKEYS.F,
		x: KEYBOARDKEYS.G,
		b: KEYBOARDKEYS.A,
		m: KEYBOARDKEYS.B,
		w: KEYBOARDKEYS.COctaveUp,
		v: KEYBOARDKEYS.DOctaveUp,

		o: KEYBOARDKEYS.Csharp,
		e: KEYBOARDKEYS.Dsharp,
		i: KEYBOARDKEYS.Fsharp,
		d: KEYBOARDKEYS.Gsharp,
		h: KEYBOARDKEYS.Asharp,
		n: KEYBOARDKEYS.CsharpOctaveUp,

        "\\": KEYBOARDKEYS.OFF
	},
	qwerty:{
		q: KEYBOARDKEYS.COctaveUp,
		w: KEYBOARDKEYS.DOctaveUp,
		e: KEYBOARDKEYS.EOctaveUp,
		r: KEYBOARDKEYS.FOctaveUp,
		t: KEYBOARDKEYS.GOctaveUp,
		y: KEYBOARDKEYS.AOctaveUp,
		u: KEYBOARDKEYS.BOctaveUp,
		i: KEYBOARDKEYS.COctaveUp2,
		o: KEYBOARDKEYS.DOctaveUp2,

		"2": KEYBOARDKEYS.CsharpOctaveUp,
		'3': KEYBOARDKEYS.DsharpOctaveUp,
		"5": KEYBOARDKEYS.FsharpOctaveUp,
		"6": KEYBOARDKEYS.GsharpOctaveUp,
		"7": KEYBOARDKEYS.AsharpOctaveUp,
		"9": KEYBOARDKEYS.CsharpOctaveUp2,

		z: KEYBOARDKEYS.C,
		x: KEYBOARDKEYS.D,
		c: KEYBOARDKEYS.E,
		v: KEYBOARDKEYS.F,
		b: KEYBOARDKEYS.G,
		n: KEYBOARDKEYS.A,
		m: KEYBOARDKEYS.B,
		",": KEYBOARDKEYS.COctaveUp,
		".": KEYBOARDKEYS.DOctaveUp,

		s: KEYBOARDKEYS.Csharp,
		d: KEYBOARDKEYS.Dsharp,
		g: KEYBOARDKEYS.Fsharp,
		h: KEYBOARDKEYS.Gsharp,
		j: KEYBOARDKEYS.Asharp,

        "\\": KEYBOARDKEYS.OFF
	},
	qwertz:{
		q: KEYBOARDKEYS.COctaveUp,
		w: KEYBOARDKEYS.DOctaveUp,
		e: KEYBOARDKEYS.EOctaveUp,
		r: KEYBOARDKEYS.FOctaveUp,
		t: KEYBOARDKEYS.GOctaveUp,
		z: KEYBOARDKEYS.AOctaveUp,
		u: KEYBOARDKEYS.BOctaveUp,
		i: KEYBOARDKEYS.COctaveUp2,
		o: KEYBOARDKEYS.DOctaveUp2,

		"2": KEYBOARDKEYS.CsharpOctaveUp,
		'3': KEYBOARDKEYS.DsharpOctaveUp,
		"5": KEYBOARDKEYS.FsharpOctaveUp,
		"6": KEYBOARDKEYS.GsharpOctaveUp,
		"7": KEYBOARDKEYS.AsharpOctaveUp,
		"9": KEYBOARDKEYS.CsharpOctaveUp2,

		y: KEYBOARDKEYS.C,
		x: KEYBOARDKEYS.D,
		c: KEYBOARDKEYS.E,
		v: KEYBOARDKEYS.F,
		b: KEYBOARDKEYS.G,
		n: KEYBOARDKEYS.A,
		m: KEYBOARDKEYS.B,
		",": KEYBOARDKEYS.COctaveUp,
		".": KEYBOARDKEYS.DOctaveUp,

		s: KEYBOARDKEYS.Csharp,
		d: KEYBOARDKEYS.Dsharp,
		g: KEYBOARDKEYS.Fsharp,
		h: KEYBOARDKEYS.Gsharp,
		j: KEYBOARDKEYS.Asharp,

        "\\": KEYBOARDKEYS.OFF
	}
};

var TRACKERMODE = {
	PROTRACKER: 1,
	FASTTRACKER: 2
};

var SETTINGS = {
	unrollLoops: false,
	unrollShortLoops: false, // Note: the conversion between byte_length loops (amiga) and time-based loops (Web Audio) is not 100% accurate for very short loops
	sustainKeyboardNotes: false,
	useHover:true,
	keyboardTable: "qwerty",
	vubars: true,
	stereoSeparation: STEREOSEPARATION.BALANCED,
	_B: true,
	loadInitialFile:true
};;
var EventBus = (function() {

    var allEventHandlers = {};

    var me = {};

    me.on = function(event, listener) {
        var eventHandlers = allEventHandlers[event];
        if (!eventHandlers) {
            eventHandlers = [];
            allEventHandlers[event] = eventHandlers;
        }
        eventHandlers.push(listener);
        return eventHandlers.length;
    };
    
    me.off = function(event,index){
        var eventHandlers = allEventHandlers[event];
        if (eventHandlers) eventHandlers[index-1]=undefined;
    }

    me._o = function(event, context) {
        var eventHandlers = allEventHandlers[event];
        if (eventHandlers) {
            var i, len = eventHandlers.length;
            for (i = 0; i < len; i++) {
                if (eventHandlers[i]) eventHandlers[i](context,event);
            }
        }
    };

    return me;
}());
;
function loadFile(url,next) {
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.responseType = "arraybuffer";
    req.onload = function (event) {
        var arrayBuffer = req.response;
        if (arrayBuffer && req.status === 200) {
            if (next) next(arrayBuffer);
        } else {
            console.error("unable to load", url);
            // do not call if player only
            if (typeof Editor !== "undefined") {
              if (next) next(false);
            }
        }
    };
    req.send(null);
}

function saveFile(b,file_a){

}

function BinaryStream(arrayBuffer, bigEndian){
	var obj = {
		index: 0,
		_N : !bigEndian
	};

	obj.goto = function(value){
		setIndex(value);
	};

	obj.jump = function(value){
		this.goto(this.index + value);
	};

	obj.readByte = function(position){
		setIndex(position);
		var b = this.dataView.getInt8(this.index);
		this.index++;
		return b;
	};

	obj.writeByte = function(value,position){
		setIndex(position);
		this.dataView.setInt8(this.index,value);
		this.index++;
	};

	obj._e = function(position){
		setIndex(position);
		var b = this.dataView.getUint8(this.index);
		this.index++;
		return b;
	};

	obj._f = function(value,position){
		setIndex(position);
		this.dataView.setUint8(this.index,value);
		this.index++;
	};

	obj.readUint = function(position){
		setIndex(position);
		var i = this.dataView.getUint32(this.index,this._N);
		this.index+=4;
		return i;
	};

	obj.writeUint = function(value,position){
		setIndex(position);
		this.dataView.setUint32(this.index,value,this._N);
		this.index+=4;
	};

	obj.readBytes = function(len,position) {
		setIndex(position);
		var buffer = new Uint8Array(len);
		var i = this.index;
		var src = this.dataView;
		if ((len += i) > this.length) len = this.length;
		var offset = 0;

		for (; i < len; ++i)
			buffer.setUint8(offset++, this.dataView.getUint8(i));
		this.index = len;
		return buffer;
	};

	obj._v = function(len,position){
		setIndex(position);
		var i = this.index;
		var src = this.dataView;
		var text = "";

		if ((len += i) > this.length) len = this.length;

		for (; i < len; ++i){
			var c = src.getUint8(i);
			if (c == 0) break;
			text += String.fromCharCode(c);
		}

		this.index = len;
		return text;
	};

	obj.writeString = function(value,position){
		setIndex(position);
		var src = this.dataView;
		var len = value.length;
		for (var i = 0; i < len; i++) src.setUint8(this.index + i,value.charCodeAt(i));
		this.index += len;
	};

	obj._I = function(value,max,paddValue,position){
		setIndex(position);
		max = max || 1;
		value = value || "";
		paddValue = paddValue || 0;
		var len = value.length;
		if (len>max) value = value.substr(0,max);
		obj.writeString(value);
		obj.fill(paddValue,max-len);
	};

	// same as readUshort
	obj._g = function(position){
		setIndex(position);
		var w = this.dataView.getUint16(this.index, this._N);
		this.index += 2;
		return w;
	};

	obj._h = function(value,position){
		setIndex(position);
		this.dataView.setUint16(this.index,value,this._N);
		this.index += 2;
	};

	obj.readLong = obj.$c = obj.readUint;
	obj.writeLong = obj.writeDWord = obj.writeUint;

	obj.readShort = function(value,position){
		setIndex(position);
		var w = this.dataView.getInt16(this.index, this._N);
		this.index += 2;
		return w;
	};

	obj.clear = function(length){
		obj.fill(0,length);
	};

	obj.fill = function(value,length){
		value = value || 0;
		length = length || 0;
		for (var i = 0; i<length; i++){
			obj.writeByte(value);
		}
	};

	obj.isEOF = function(margin){
		margin = margin || 0;
		return this.index >= (this.length-margin);
	};

	function setIndex(value){
		value = value === 0 ? value : value || obj.index;
		if (value<0) value = 0;
		if (value >= obj.length) value = obj.length-1;

		obj.index = value;
	}

  if (arrayBuffer) {
    obj.buffer = arrayBuffer;
    obj.dataView = new DataView(arrayBuffer);
    obj.length = arrayBuffer.byteLength;
  }

	return obj;
}
;
var Audio = (function(){
    var me = {};

    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    window.OfflineAudioContext = window.OfflineAudioContext||window.webkitOfflineAudioContext;

    var context;
    var masterVolume;
    var cutOffVolume;
    var lowPassfilter;
    var i;
    var filterChains = [];
    var isRecording;
    var recordingAvailable;
    var mediaRecorder;
    var recordingChunks = [];
    var offlineContext;
    var onlineContext;
    var currentStereoSeparation = STEREOSEPARATION.BALANCED;
    var lastMasterVolume = 0;
    var usePanning;
    var hasUI;
    var scheduledNotes = [[],[],[]];
    var scheduledNotesBucket = 0;
    var prevSampleRate = 4143.569;

    var filters = {
        volume: true,
        panning: true,
        high: true,
        mid: true,
        low: true,
        lowPass : true,
        reverb: true,
        distortion: false
    };

    var isRendering = false;

    function createAudioConnections(audioContext,destination){

        cutOffVolume = audioContext.createGain();
        cutOffVolume.gain.setValueAtTime(1,0);

        // Haas effect stereo expander
        var useStereoExpander = false;
        if (useStereoExpander){
            var splitter = audioContext.createChannelSplitter(2);
            var merger = audioContext.createChannelMerger(2);
            var haasDelay = audioContext.createDelay(1);
            cutOffVolume.connect(splitter);
            splitter.connect(haasDelay, 0);
            haasDelay.connect(merger, 0, 0);
            splitter.connect(merger, 1, 1);
            merger.connect(destination || audioContext.destination);
            window.haasDelay = haasDelay;
        }else{
            cutOffVolume.connect(destination || audioContext.destination);
        }







        masterVolume = audioContext.createGain();
        masterVolume.connect(cutOffVolume);
        me.setMasterVolume(1);

        lowPassfilter = audioContext.createBiquadFilter();
        lowPassfilter.type = "lowpass";
        lowPassfilter.frequency.setValueAtTime(20000,0);

        lowPassfilter.connect(masterVolume);

        me.masterVolume = masterVolume;
        me.cutOffVolume = cutOffVolume;
        me.lowPassfilter = lowPassfilter;
    }

    if (AudioContext){
        context = new AudioContext();
    }

    me.init = function(audioContext,destination){

        audioContext = audioContext || context;
        context = audioContext;
        me.context = context;
        if (!audioContext) return;

        usePanning = !!Audio.context.createStereoPanner;
        if (!usePanning){
            console.warn("Warning: Your browser does not support StereoPanners ... all mods will be played in mono!")
        }
        hasUI = typeof Editor !== "undefined";

        createAudioConnections(audioContext,destination);

        var numberOfTracks = Tracker.$b();
        filterChains = [];

        function addFilterChain(){
            var filterChain = FilterChain(filters);
            filterChain.output().connect(lowPassfilter);
            filterChains.push(filterChain);
        }

        for (i = 0; i<numberOfTracks;i++)addFilterChain();

        me.filterChains = filterChains;
		me.usePanning = usePanning;

        if (!isRendering){
            EventBus.on(EVENT.trackStateChange,function(state){
                if (typeof state.track != "undefined" && filterChains[state.track]){
                    filterChains[state.track].volumeValue(state.mute?0:70);
                }
            });


			EventBus.on(EVENT.trackCountChange,function(trackCount){
				for (i = filterChains.length; i<trackCount;i++)addFilterChain();
				EventBus._o(EVENT.filterChainCountChange,trackCount);
				me.setStereoSeparation(currentStereoSeparation);
			});

			EventBus.on(EVENT.trackerModeChanged,function(mode){
				me.setStereoSeparation();
			});
        }
    };


    me.enable = function(){
        cutOffVolume.gain.setValueAtTime(1,0);
        me.cutOff = false;
    };

    me.disable = function(){
        cutOffVolume.gain.setValueAtTime(0,0);
        me.cutOff = true;

        var totalNotes = 0;
		scheduledNotes.forEach(function(bucket,index){
			totalNotes += bucket.length;
		    bucket.forEach(function(volume){
		        volume.gain.cancelScheduledValues(0);
		        volume.gain.setValueAtTime(0,0);
			});
			scheduledNotes[index] = [];
        });

        if (totalNotes) console.log(totalNotes + " cleared");
    };

    me.checkState = function(){
        if (context){
            if (context.state === "suspended" && context.resume){
                console.warn("Audio context is suspended - trying to resume");
                context.resume();
            }
        }
    };


    me.playSample = function(index,_b,volume,track,effects,time,noteIndex){

        var audioContext;
        if (isRendering){
            audioContext = offlineContext;
        }else{
            audioContext = context;
            me.enable();
        }

		_b = _b || 428; // C-3
        if (typeof track === "undefined") track = (hasUI ? Editor.getCurrentTrack() : 0);
		time = time || context.currentTime;

        if (noteIndex === NOTEOFF){
            volume = 0; // note off
        }

        var _u = Tracker.getInstrument(index);
        var basePeriod = _b;
		var _c;
		var _d;
		var scheduled;
		var pan = 0;

		if (_u){
            var sampleBuffer;
            var offset = 0;
            var sampleLength = 0;

            volume = typeof volume === "undefined" ? (100*_u.sample.volume/64) : volume;

            pan = (_u.sample.panning || 0) / 128;

			var sampleRate;

			// apply finetune
			if (Tracker._j()){
                if (Tracker._s){
					_b -= _u._G()/2;
				}else{
					if (_u._G()){
						_b = me._E(noteIndex,_u._G());
					}
                }
            }else{
                // protracker frequency
				if (_u._G()){
					_b = me._F(_b,_u._G());
				}
            }

            sampleRate = me._P(_b);
            var initialPlaybackRate = 1;

            if (_u.sample.data.length) {
                sampleLength = _u.sample.data.length;
                if (effects && effects.offset){
                    if (effects.offset.value>=sampleLength) effects.offset.value = sampleLength-1;
                    offset = effects.offset.value/audioContext.sampleRate; // in seconds
                }
                // note - on safari you can't set a different samplerate?
                sampleBuffer = audioContext.createBuffer(1, sampleLength,audioContext.sampleRate);
                initialPlaybackRate = sampleRate / audioContext.sampleRate;
            }else {
                // empty samples are often used to cut of the previous _u
                sampleBuffer = audioContext.createBuffer(1, 1, audioContext.sampleRate);
                offset = 0;
            }
            var buffering = sampleBuffer.getChannelData(0);
            for(i=0; i < sampleLength; i++) {
                buffering[i] = _u.sample.data[i];
            }

			prevSampleRate = sampleRate;
            var source = audioContext.createBufferSource();
            source.buffer = sampleBuffer;

            var volumeGain = audioContext.createGain();
            volumeGain.gain.value = volume/100;
			volumeGain.gain.setValueAtTime(volume/100,time);

            if (_u.sample.loop.enabled && _u.sample.loop.length>2){

                if (!SETTINGS.unrollLoops){

                    source.loop = true;
                    // in seconds ...
                    source.loopStart = _u.sample.loop.start/audioContext.sampleRate;
                    source.loopEnd = (_u.sample.loop.start + _u.sample.loop.length)/audioContext.sampleRate;
                    //audioContext.sampleRate = samples/second
                }
            }

            if (_u._c.enabled || _u._d.enabled || _u.hasVibrato()){

            	var envelopes = _u.noteOn(time);
            	var target = source;

            	if (envelopes.volume){
					_c = envelopes.volume;
					source.connect(_c);
					target = _c;
				}

				if (envelopes.panning){
					_d = envelopes.panning;
					target.connect(_d);
					target = _d;
				}

				scheduled = envelopes.scheduled;

				target.connect(volumeGain);

            }else{
                source.connect(volumeGain);
            }

			var _X = Audio.context.createGain();
			_X.gain.setValueAtTime(0,time);
			_X.gain.linearRampToValueAtTime(1,time + 0.01);
			volumeGain.connect(_X);

			if (usePanning){
				var panning = Audio.context.createStereoPanner();
				panning.pan.setValueAtTime(pan,time);
				_X.connect(panning);
				panning.connect(filterChains[track].input());
            }else{

				/* 
				Note: a pannernode would work too but this doesn't have a "setPositionInTime" method
				Making it a bit useless
				panning = Audio.context.createPanner();
				panning.panningModel = 'equalpower';
				panning.setPosition(pan, 0, 1 - Math.abs(pan));
				*/
				
				_X.connect(filterChains[track].input());
            }


            source.playbackRate.value = initialPlaybackRate;
            var sourceDelayTime = 0;
            var playTime = time + sourceDelayTime;

            source.start(playTime,offset);
            var result = {
                source: source,
                volume: volumeGain,
                panning: panning,
				_c: _c,
				_d: _d,
				_X: _X,
                _Y: volume,
                _V: volume,
                _U: _b,
                basePeriod: basePeriod,
                noteIndex: noteIndex,
                startPlaybackRate: initialPlaybackRate,
                sampleRate: sampleRate,
                _q: index,
                effects: effects,
                track: track,
                time: time,
				scheduled: scheduled
            };

			scheduledNotes[scheduledNotesBucket].push(volumeGain);

            if (!isRendering) EventBus._o(EVENT.samplePlay,result);

            return result;
        }

        return {};
    };

    me.playSilence = function(){
        // used to activate Audio engine on first touch in IOS and Android devices
        if (context){
            var source = context.createBufferSource();
            source.connect(masterVolume);
            try{
            	source.start();
			}catch (e){
            	console.error(e);
			}
        }
    };

	me.playRaw = function(data,sampleRate){
		// used to loose snippets of samples (ranges etc)
		if (context && data && data.length){
			var sampleBuffer;
			sampleBuffer = context.createBuffer(1,data.length,context.sampleRate);
			var initialPlaybackRate = sampleRate / audioContext.sampleRate;
			var source = context.createBufferSource();
			source.buffer = sampleBuffer;
			source.loop = true;
			source.playbackRate.value = initialPlaybackRate;
			source.connect(masterVolume);
			source.start();
		}
	};



    me.setStereoSeparation = function(value){

		var panAmount;
		var numberOfTracks = Tracker.$b();

    	if (Tracker._j()){
    		panAmount = 0;
		}else{
			value = value || currentStereoSeparation;
			currentStereoSeparation = value;

			switch(value){
				case STEREOSEPARATION.NONE:
					// mono, no panning
					panAmount = 0;
					SETTINGS.stereoSeparation = STEREOSEPARATION.NONE;
					break;
				case STEREOSEPARATION.FULL:
					// Amiga style: pan even channels hard to the left, uneven to the right;
					panAmount = 1;
					SETTINGS.stereoSeparation = STEREOSEPARATION.FULL;
					break;
				default:
					// balanced: pan even channels somewhat to the left, uneven to the right;
					panAmount = 0.5;
					SETTINGS.stereoSeparation = STEREOSEPARATION.BALANCED;
					break;
			}
		}

        for (i = 0; i<numberOfTracks;i++){
            var filter = filterChains[i];
            if (filter) filter.panningValue((i%4===0)||(i%4===3) ? -panAmount : panAmount);
        }
    };

    me.getPrevSampleRate = function(){
    	return prevSampleRate;
	};

    me.context = context;

    function createPingPongDelay(){

        // example of delay effect.
        //Taken from http://stackoverflow.com/questions/20644328/using-channelsplitter-and-mergesplitter-nodes-in-web-audio-api

        var delayTime = 0.12;
        var feedback = 0.3;

        var merger = context.createChannelMerger(2);
        var leftDelay = context.createDelay();
        var rightDelay = context.createDelay();
        var leftFeedback = context.createGain();
        var rightFeedback = context.createGain();
        var splitter = context.createChannelSplitter(2);


        splitter.connect( leftDelay, 0 );
        splitter.connect( rightDelay, 1 );

        leftDelay.delayTime.value = delayTime;
        rightDelay.delayTime.value = delayTime;

        leftFeedback.gain.value = feedback;
        rightFeedback.gain.value = feedback;

        // Connect the routing - left bounces to right, right bounces to left.
        leftDelay.connect(leftFeedback);
        leftFeedback.connect(rightDelay);

        rightDelay.connect(rightFeedback);
        rightFeedback.connect(leftDelay);

        // Re-merge the two delay channels into stereo L/R
        leftFeedback.connect(merger, 0, 0);
        rightFeedback.connect(merger, 0, 1);

        // Now connect your input to "splitter", and connect "merger" to your output destination.

        return{
            splitter: splitter,
            merger: merger
        }
    }

    /**

     get a new AudioNode playing at x semitones from the root note
     // used to create Chords and Arpeggio

     @_i {audioNode} source: audioBuffer of the root note
     @_i {Number} root: _b of the root note
     @_i {Number} semitones: amount of semitones from the root note
     @_i {Number} finetune: finetune value of the base _u
     @return {audioNode} audioBuffer of the new note
     */
    function semiTonesFrom(source,root,semitones,finetune){
        var target;

        target = context.createBufferSource();
        target.buffer = source.buffer;

        if (semitones){
            var rootNote = _bNoteTable[root];
            var rootIndex = noteNames.indexOf(rootNote._a);
            var targetName = noteNames[rootIndex+semitones];
            if (targetName){
                var targetNote = _aNoteTable[targetName];
                if (targetNote){
                    target.playbackRate.value = (rootNote._b/targetNote._b) * source.playbackRate.value;
                }
            }
        }else{
            target.playbackRate.value = source.playbackRate.value
        }

        return target;

    }

    me.getSemiToneFrom = function(_b,semitones,finetune){
        var result = _b;
        if (finetune) {
            _b = me._GBasePeriod(_b,finetune);
            if (!_b){
                _b = result;
                console.error("ERROR: base _b for finetuned " + finetune + " _b " + _b + " not found");
            }
        }

        if (semitones){
            var rootNote = _bNoteTable[_b];
            if (rootNote){
                var rootIndex = noteNames.indexOf(rootNote._a);
                var targetName = noteNames[rootIndex+semitones];
                if (targetName){
                    var targetNote = _aNoteTable[targetName];
                    if (targetNote){
                        result = targetNote._b;
                        if (finetune) {result = me._F(result,finetune)}
                    }
                }
            }else{
                console.error("ERROR: note for _b " + _b + " not found");
                // note: this can happen when the note is in a _b slide
                // FIXME
            }
        }
        return result;
    };

    me.getNearestSemiTone = function(_b,_q){
        var tuning = 8;
        if (_q){
            var _u = Tracker.getInstrument(_q);
            if (_u && _u.sample.finetune) tuning = tuning + _u.sample.finetune;
        }

        var minDelta = 100000;
        var result = _b;
        for (var note in NOTEPERIOD){
            if (NOTEPERIOD.hasOwnProperty(note)){
                var p = NOTEPERIOD[note].tune[tuning];
                var delta = Math.abs(p - _b);
                if (delta<minDelta) {
                    minDelta = delta;
                    result = p;
                }
            }
        }

        return result;
    };

    // gives the finetuned _b for a base _b - protracker mode
    me._F = function(_b,finetune){
        var result = _b;
        var note = _bNoteTable[_b];
        if (note && note.tune){
            var centerTune = 8;
            var tune = 8 + finetune;
            if (tune>=0 && tune<note.tune.length) result = note.tune[tune];
        }

        return result;
    };

    // gives the finetuned _b for a base note (Fast Tracker Mode)
    me._E = function(note,finetune){
        if (note === NOTEOFF) return 1;

        var ftNote1 = FTNotes[note];
        var ftNote2 = finetune>0 ? FTNotes[note+1] : FTNotes[note-1] ;

        if (ftNote1 && ftNote2){
            var delta = Math.abs(ftNote2._b - ftNote1._b) / 127;
            return ftNote1._b - (delta*finetune)
        }

        console.warn("unable to find finetune for note " + note,ftNote1);
		return ftNote1 ? ftNote1._b : 100000;

    };

    // gives the non-finetuned base_b for a finetuned _b
    me._GBasePeriod = function(_b,finetune){
        var result = _b;
        var table = _bFinetuneTable[finetune];
        if (table){
            result = table[_b];
        }
        return result;
    };

	me._P = function(_b){
		if (Tracker._j()){
			if (Tracker._s) return (8363 * Math.pow(2,((4608 - _b) / 768)));
			return PC_FREQUENCY_HALF / _b;
		}
		return AMIGA_PALFREQUENCY_HALF / _b;
	};

    me.limitAmigaPeriod = function(_b){
        // limits the _b to the allowed Amiga frequency range, between 113 (B3) and 856 (C1)

        _b = Math.max(_b,113);
        _b = Math.min(_b,856);

        return _b;
    };

    me.setAmigaLowPassFilter = function(on,time){
        // note: this is determined by ear comparing a real Amiga 500 - maybe too much effect ?
        var value = on ? 2000 : 20000;
        lowPassfilter.frequency.setValueAtTime(value,time);
    };

    me.setMasterVolume = function (value,time) {
        time=time||context.currentTime;
        value = value*0.7;
        masterVolume.gain.setValueAtTime(lastMasterVolume,time);
		masterVolume.gain.linearRampToValueAtTime(value,time+0.02);
		lastMasterVolume = value;
	};

	me.slideMasterVolume = function (value,time) {
		time=time||context.currentTime;
		value = value*0.7;
		masterVolume.gain.linearRampToValueAtTime(value,time);
		lastMasterVolume = value;
	};

	me.getLastMasterVolume = function(){
		return lastMasterVolume/0.7;
	};

    me.clearScheduledNotesCache = function(){
        // 3 rotating caches
		scheduledNotesBucket++;
		if (scheduledNotesBucket>2) scheduledNotesBucket=0;
        scheduledNotes[scheduledNotesBucket] = [];
    };

    me._r = {
        sine: function(_b,progress,freq,amp){
            return _b + (Math.sin(progress * freq * 0.8) * amp * 1.7);
            // I got the impression that this formaula is more like  amp * 2 in FT2
            // in Protracker a lookuptable is used - maybe we should adopt that
        },
		saw : function(_b,progress,freq,amp){
			var value = 1 - Math.abs(((progress * freq/7) % 1)); // from 1 to 0
			value = (value * 2) - 1; // from -1 to 1
			value = value * amp * -2;
			return _b + value;
		},
        square : function(_b,progress,freq,amp){
            var value = Math.sin(progress * freq) <= 0 ? -1 : 1;
            value = value * amp * 2;
            return _b + value;
        },
		sawInverse : function(_b,progress,freq,amp){
			var value = Math.abs((progress * freq/7) % 1); // from 0 to 1
			value = (value * 2) - 1; // from -1 to 1
			value = value * amp * -2;
			return _b + value;
		}
    };

    return me;

}());

;
function getUrlParameter(_i){
    if (window.location.getParameter){
        return window.location.getParameter(_i);
    } else if (location.search) {
        var parts = location.search.substring(1).split('&');
        for (var i = 0; i < parts.length; i++) {
            var nv = parts[i].split('=');
            if (!nv[0]) continue;
            if (nv[0] == _i) {
                return nv[1] || true;
            }
        }
    }
}

function formatFileSize(size){
    var unit = "k";
    if (isNaN(size)) size=0;
    size = Math.round(size/1000);
    if (size>1000){
        size = Math.round(size/100)/10;
        unit = "MB"
    }
    return size + unit;
}


;
//https://github.com/sebpiq/WAAClock/

;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
    var WAAClock = require('./lib/WAAClock')

    module.exports = WAAClock
    if (typeof window !== 'undefined') window.WAAClock = WAAClock

},{"./lib/WAAClock":2}],3:[function(require,module,exports){
// shim for using process in browser

    var process = module.exports = {};

    process.nextTick = (function () {
        var canSetImmediate = typeof window !== 'undefined'
            && window.setImmediate;
        var canPost = typeof window !== 'undefined'
                && window.postMessage && window.addEventListener
            ;

        if (canSetImmediate) {
            return function (f) { return window.setImmediate(f) };
        }

        if (canPost) {
            var queue = [];
            window.addEventListener('message', function (ev) {
                var source = ev.source;
                if ((source === window || source === null) && ev.data === 'process-tick') {
                    ev.stopPropagation();
                    if (queue.length > 0) {
                        var fn = queue.shift();
                        fn();
                    }
                }
            }, true);

            return function nextTick(fn) {
                queue.push(fn);
                window.postMessage('process-tick', '*');
            };
        }

        return function nextTick(fn) {
            setTimeout(fn, 0);
        };
    })();

    process.title = 'browser';
    process.browser = true;
    process.env = {};
    process.argv = [];

    process.binding = function (_a) {
        throw new Error('process.binding is not supported');
    }

// TODO(shtylman)
    process.cwd = function () { return '/' };
    process.chdir = function (dir) {
        throw new Error('process.chdir is not supported');
    };

},{}],2:[function(require,module,exports){
    var process=require("__browserify_process");var isBrowser = (typeof window !== 'undefined')

    if (isBrowser && !AudioContext)
        throw new Error('This browser doesn\'t seem to support web audio API')

    var CLOCK_DEFAULTS = {
        _n: 0.10,
        _m: 0.001
    }

// ==================== Event ==================== //
    var Event = function(clock, deadline, func) {
        this.clock = clock
        this.func = func
        this.repeatTime = null
        this._n = CLOCK_DEFAULTS._n
        this._m = CLOCK_DEFAULTS._m
        this._armed = false
        this._latestTime = null
        this._earliestTime = null
        this.schedule(deadline)
    }

// Unschedules the event
    Event.prototype.clear = function() {
        this.clock._removeEvent(this)
        return this
    }

// Sets the event to repeat every `time` seconds.
    Event.prototype.repeat = function(time) {
        if (time === 0)
            throw new Error('delay cannot be 0')
        this.repeatTime = time
        return this
    }

// Sets the time tolerance of the event.
// The event will be executed in the interval `[deadline - early, deadline + late]`
// If the clock fails to execute the event in time, the event will be dropped.
    Event.prototype.tolerance = function(values) {
        if (typeof values.late === 'number')
            this._n = values.late
        if (typeof values.early === 'number')
            this._m = values.early
        this._update()
        return this
    }

// Returns true if the event is repeated, false otherwise
    Event.prototype.isRepeated = function() { return this.repeatTime !== null }

// Schedules the event to be ran before `deadline`.
// If the time is within the event tolerance, we handle the event immediately
    Event.prototype.schedule = function(deadline) {
        this._armed = true
        this.deadline = deadline
        this._update()
        if (this.clock.context.currentTime >= this._earliestTime) {
            this.clock._removeEvent(this)
            this._execute()
        }
    }

// Executes the event
    Event.prototype._execute = function() {
        this._armed = false
        if (this.clock.context.currentTime < this._latestTime)
            this.func(this);
        else {
            //if (this.onexpired) this.onexpired(this)
			console.warn('event expired');
            if (EventBus) EventBus._o(EVENT.clockEventExpired);
        }
        // In the case `schedule` is called inside `func`, we need to avoid
        // overrwriting with yet another `schedule`
        if (this._armed === false && this.isRepeated())
            this.schedule(this.deadline + this.repeatTime)
    };

// This recalculates some cached values and re-insert the event in the clock's list
// to maintain order.
    Event.prototype._update = function() {
        this._latestTime = this.deadline + this._n
        this._earliestTime = this.deadline - this._m
        this.clock._removeEvent(this)
        this.clock._insertEvent(this)
    }

// ==================== WAAClock ==================== //
    var WAAClock = module.exports = function(context, opts) {
        var self = this
        opts = opts || {}
        this._m = opts._m || CLOCK_DEFAULTS._m
        this._n = opts._n || CLOCK_DEFAULTS._n
        this.context = context
        this._events = []
        this._started = false
    }

// ---------- Public API ---------- //
// Schedules `func` to run after `delay` seconds.
    WAAClock.prototype.setTimeout = function(func, delay) {
        return this._createEvent(func, this._absTime(delay))
    }

// Schedules `func` to run before `deadline`.
    WAAClock.prototype.callbackAtTime = function(func, deadline) {
        return this._createEvent(func, deadline)
    }

// Stretches `deadline` and `repeat` of all scheduled `events` by `ratio`, keeping
// their relative distance to `tRef`. In fact this is equivalent to changing the tempo.
    WAAClock.prototype.timeStretch = function(tRef, events, ratio) {
        var self = this
            , currentTime = self.context.currentTime

        events.forEach(function(event) {
            if (event.isRepeated()) event.repeat(event.repeatTime * ratio)

            var deadline = tRef + ratio * (event.deadline - tRef)
            // If the deadline is too close or past, and the event has a repeat,
            // we calculate the next repeat possible in the stretched space.
            if (event.isRepeated()) {
                while (currentTime >= deadline - event._m)
                    deadline += event.repeatTime
            }
            event.schedule(deadline)


        })
        return events
    }

// ---------- Private ---------- //

// Removes all scheduled events and starts the clock
    WAAClock.prototype.start = function() {
        if (this._started === false) {
            var self = this
            this._started = true
            this._events = []

            var bufferSize = 256
            // We have to keep a reference to the node to avoid garbage collection
            this._clockNode = this.context.createScriptProcessor(bufferSize, 1, 1)
            this._clockNode.connect(this.context.destination)
            this._clockNode.onaudioprocess = function () {
                process.nextTick(function() { self._tick() })
            }
        }
    }

// Stops the clock
    WAAClock.prototype.stop = function() {
        if (this._started === true) {
            this._started = false
            this._clockNode.disconnect()
        }
    }

// This function is ran _bically, and at each tick it executes
// events for which `currentTime` is included in their tolerance interval.
    WAAClock.prototype._tick = function() {
        var event = this._events.shift()

        while(event && event._earliestTime <= this.context.currentTime) {
            event._execute()
            event = this._events.shift()
        }

        // Put back the last event
        if(event) this._events.unshift(event)
    }

// Creates an event and insert it to the list
    WAAClock.prototype._createEvent = function(func, deadline) {
        var event = new Event(this, deadline, func)
        event.tolerance({late: this._n, early: this._m})
        return event
    }

// Inserts an event to the list
    WAAClock.prototype._insertEvent = function(event) {
        this._events.splice(this._indexByTime(event._earliestTime), 0, event)
    }

// Removes an event from the list
    WAAClock.prototype._removeEvent = function(event) {
        var ind = this._events.indexOf(event)
        if (ind !== -1) this._events.splice(ind, 1)
    }

// Returns the index of the first event whose deadline is >= to `deadline`
    WAAClock.prototype._indexByTime = function(deadline) {
        // performs a binary search
        var low = 0
            , high = this._events.length
            , mid
        while (low < high) {
            mid = Math.floor((low + high) / 2)
            if (this._events[mid]._earliestTime < deadline)
                low = mid + 1
            else high = mid
        }
        return low
    }

// Converts from relative time to absolute time
    WAAClock.prototype._absTime = function(relTime) {
        return relTime + this.context.currentTime
    }

// Converts from absolute time to relative time
    WAAClock.prototype._relTime = function(absTime) {
        return absTime - this.context.currentTime
    }
},{"__browserify_process":3}]},{},[1])
;;
FilterChain = (function(filters) {

	var me = {};

	filters = filters || {
		volume: true,
		panning: true
	};

    // disable for now: sounds muffled;
	var disableFilters = true;

	if (disableFilters){
        filters = {
            volume: true,
            panning: true
        };
	}

	var useVolume = filters.volume;
	var usePanning = filters.panning && Audio.context.createStereoPanner;
	var useHigh = filters.high;
	var useMid = filters.mid;
	var useLow = filters.low;
	var useLowPass = filters.lowPass;
	var useReverb = filters.reverb;
	var useDistortion = filters.distortion;

	var input,output,output2;

	var lowValue = 0.0;
	var midValue = 0.0;
	var highValue = 0.0;
	var volumeValue = 70;
	var panningValue = 0;

	var FREQ_MUL = 7000;
	var QUAL_MUL = 30;

	var context = Audio.context;

	var volumeGain,highGain,midGain,lowGain,lowPassfilter,reverb,reverbGain,panner;

	// use a simple Gain as input so that we can leave this connected while changing filters
	input = context.createGain();
    input.gain.value=1;
    output = input;


    function connectFilters(){

    	output = input;

        if (useHigh){
            highGain = highGain || createHigh();
            output.connect(highGain);
            output = highGain;
        }

        if (useMid){
            midGain = midGain || createMid();
            output.connect(midGain);
            output = midGain;
        }

        if (useLow){
            lowGain = lowGain || createLow();
            output.connect(lowGain);
            output = lowGain;
        }

        if (useLowPass){
            lowPassfilter = lowPassfilter || createLowPass();
            output.connect(lowPassfilter);
            output = lowPassfilter;
        }

        if (useReverb){
            reverb = reverb || context.createConvolver();
            reverbGain = reverbGain || context.createGain();
            reverbGain.gain.value = 0;

            output.connect(reverbGain);
            reverbGain.connect(reverb);
            output2 = reverb;
        }

        if (useDistortion){
            var distortion = context.createWaveShaper();
            distortion.curve = distortionCurve(400);
            distortion.oversample = '4x';
        }

        if (usePanning){
            panner =  panner || Audio.context.createStereoPanner();
            output.connect(panner);
            output = panner;
        }

        // always use volume as last node - never disconnect this

		volumeGain = volumeGain ||context.createGain();
        output.connect(volumeGain);
        if (output2) output2.connect(volumeGain);
        output = volumeGain;

	}

	function disConnectFilter(){
        input.disconnect();
        if (highGain) highGain.disconnect();
        if (midGain) midGain.disconnect();
        if (lowGain) lowGain.disconnect();
        if (lowPassfilter) lowPassfilter.disconnect();
        if (reverbGain) reverbGain.disconnect();
		if (panner) panner.disconnect();
        output2 = undefined;
	}


	function createHigh(){
		var filter = context.createBiquadFilter();
		filter.type = "highshelf";
		filter.frequency.value = 3200.0;
		filter.gain.value = highValue;
		return filter;
	}

	function createMid(){
        var filter = context.createBiquadFilter();
        filter.type = "peaking";
        filter.frequency.value = 1000.0;
        filter.Q.value = 0.5;
        filter.gain.value = midValue;
        return filter;
	}

	function createLow(){
        var filter = context.createBiquadFilter();
        filter.type = "lowshelf";
        filter.frequency.value = 320.0;
        filter.gain.value = lowValue;
        return filter;
	}

	function createLowPass(){
        var filter =  context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 5000;
        return filter;
	}

	function init(){
        connectFilters();
		me.volumeValue(volumeValue);
	}

	function distortionCurve(amount) {
		var k = typeof amount === 'number' ? amount : 50,
				n_samples = 44100,
				curve = new Float32Array(n_samples),
				deg = Math.PI / 180,
				i = 0,
				x;
		for ( ; i < n_samples; ++i ) {
			x = i * 2 / n_samples - 1;
			curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
		}
		return curve;
	}

	me.lowValue = function(value) {
		if (!useLow) return;
		if (typeof value !== "undefined"){
			var maxRange = 20;
			lowValue = value;
			lowGain.gain.value = lowValue * maxRange  ;
		}
		return lowValue;
	};

	me.midValue = function(value) {
		if (!useMid) return;
		if (typeof value !== "undefined"){
			var maxRange = 20;
			midValue = value;
			midGain.gain.value = midValue * maxRange  ;
		}
		return midValue;
	};

	me.highValue = function(value) {
		if (!useHigh) return;
		if (typeof value !== "undefined"){
			var maxRange = 20;
			highValue = value;
			highGain.gain.value = highValue * maxRange  ;
		}
		return highValue;
	};

	me.lowPassFrequencyValue = function(value) {
		if (!useLowPass) return;
		// Clamp the frequency between the minimum value (40 Hz) and half of the
		// sampling rate.
		var minValue = 40;
		var maxValue = Audio.context.sampleRate / 2;
		// Logarithm (base 2) to compute how many octaves fall in the range.
		var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
		// Compute a multiplier from 0 to 1 based on an exponential scale.
		var multiplier = Math.pow(2, numberOfOctaves * (value - 1.0));
		// Get back to the frequency value between min and max.

		lowPassfilter.frequency.value = maxValue * multiplier;
	};

	me.lowPassQualityValue = function(value) {
		if (!useLowPass) return;
		lowPassfilter.Q.value = value * QUAL_MUL;
	};

	me.reverbValue = function(value) {
		if (!useReverb) return;
		if (!reverb.buffer){
			var buffer = cachedAssets.audio["data/reverb/sportcentre.m4a"];
			if (!buffer){
				var preLoader = PreLoader();
				preLoader.load(["data/reverb/sportcentre.m4a"],PRELOADTYPE.audio,function(){
					console.error("reverb buffer loaded");
					reverb.buffer = cachedAssets.audio["data/reverb/sportcentre.m4a"];
				});
			}else{
				reverb.buffer = buffer;
			}
		}

		var max = 100;
		var fraction = parseInt(value) / max;
		reverbGain.gain.value = fraction * fraction;

	};

	me.volumeValue = function(value) {
		if (!useVolume) return;
		if (typeof value !== "undefined"){
			var max = 100;
			volumeValue = value;
			var fraction = value / max;
			volumeGain.gain.value = fraction * fraction;
		}
		return volumeValue;
	};

	me.panningValue = function(value,time) {
		if (!usePanning) return;

		if (typeof value !== "undefined"){
			panningValue = value;
			if (time){
				panner.pan.setValueAtTime(panningValue,time);
			}else{
				// very weird bug in safari on OSX ... setting pan.value directy to 0 does not work
				panner.pan.setValueAtTime(panningValue,Audio.context.currentTime);
			}

		}
		return panningValue;
	};

	me.setState = function(_a,value){
		disConnectFilter();

        if (_a==="high") useHigh=!!value;
        if (_a==="mid") useMid=!!value;
        if (_a==="low") useLow=!!value;
        if (_a==="lowPass") useLowPass=!!value;
        if (_a==="reverb") useReverb=!!value;
        if (_a==="panning") usePanning=(!!value) && Audio.context.createStereoPanner;

        connectFilters();

	};

	me.input = function(){
		return input;
	};

	me.output = function(){
		return output;
	};

	init();

	return me;

});





;
var _bNoteTable = {};
var _bFinetuneTable = {};
var _aNoteTable = {};
var noteNames = [];
var FTNotes = [];
var FTPeriods = [];

var Tracker = (function(){

	// TODO: strip UI stuff
	var me = {};
	me.isMaster = true;

	var clock;

	var isRecording = false;
	var isPlaying = false;

	var song;
	var _us = [];

	var _ZIndex = 1;
	var prevInstrumentIndex;
	var currentPattern = 0;
	var prevPattern;
	var currentPatternPos = 0;
	var prevPatternPos;
	var currentPlayType = PLAYTYPE.song;
	var currentPatternData;

	var currentSongPosition = 0;
	var prevSongPosition = 0;

	var _pFunction;
	var tremoloFunction;

	var bpm = 125; // bmp
	var ticksPerStep = 6;
	var tickTime = 2.5/bpm;
	var tickCounter = 0;
	var mainTimer;

	var trackCount = 4;
	var patternLength = 64;
	var trackerMode = TRACKERMODE.PROTRACKER;

	var swing = 0; // swing in milliseconds. NOTE: this is not part of any original Tracker format, just nice to have on beat sequences

	var trackNotes = [];
	var trackEffectCache = [];
	var trackerStates = [];
	var patternLoopStart = [];
	var patternLoopCount = [];
	
	//console.log("ticktime: " + tickTime);

	me.init = function(config){

		for (var i=0;i<trackCount;i++){
			trackNotes.push({});
			trackEffectCache.push({});
		}
		
		for (var i = -8; i<8;i++){
			_bFinetuneTable[i] = {};
		}

		for (var key in NOTEPERIOD){
			if (NOTEPERIOD.hasOwnProperty(key)){
				var note = NOTEPERIOD[key];
				_bNoteTable[note._b] = note;
				_aNoteTable[note._a] = note;
				noteNames.push(note._a);

				// build fineTune table
				if (note.tune){
					for (i = -8; i<8;i++){
						var table =  _bFinetuneTable[i];
						var index = i+8;
						table[note.tune[index]] = note._b;
					}
				}
			}
		}

		var ftCounter = 0;
		for (key in FTNOTEPERIOD){
			if (FTNOTEPERIOD.hasOwnProperty(key)){
				var ftNote = FTNOTEPERIOD[key];
				if (!ftNote._b) ftNote._b = 1;
				FTNotes.push(ftNote);
				FTPeriods[ftNote._b] = ftCounter;
				if (ftNote._k) FTPeriods[ftNote._k] = ftCounter;
				ftCounter++;
			}
		}

		if (config) {
			Host.init();
			Audio.init(config.audioContext,config.audioDestination);
			if (config.plugin){
				me.isPlugin = true;
				UI.initPlugin(config);
				if (typeof config.isMaster === "boolean") me.isMaster = config.isMaster;
				if (config.handler){
					EventBus.on(EVENT.songBPMChange,function(bpm){
						config.handler(EVENT.songBPMChange,bpm);
					});
					EventBus.on(EVENT.songBPMChangeIgnored,function(bpm){
						config.handler(EVENT.songBPMChangeIgnored,bpm);
					});



					EventBus.on(EVENT.songSpeedChange,function(speed){
						config.handler(EVENT.songSpeedChange,speed);
					});
					EventBus.on(EVENT.songSpeedChangeIgnored,function(speed){
						config.handler(EVENT.songSpeedChangeIgnored,speed);
					});


					EventBus.on(EVENT.patternEnd,function(time){
						config.handler(EVENT.patternEnd,time);
					});
				}
			}
		}

	};
	
	me.setMaster = function(value){
		me.isMaster = value;
	}

	me.isMaster = function(){
		return !!me.isMaster;
	}

	me._S = function(index){
		if (song._us[index]){
			_ZIndex = index;
			if (prevInstrumentIndex!=_ZIndex) EventBus._o(EVENT._uChange,_ZIndex);
			prevInstrumentIndex = _ZIndex;
		}else{
			if (index<=me.getMaxInstruments()){
				for (var i = song._us.length, max = index;i<=max;i++){
					me.setInstrument(i,Instrument());
				}

				var _uContainer = [];
				for (i = 1;i<=max;i++){
					var _u = song._us[i] || {_a:""};
					_uContainer.push({label: i + " " + _u._a, data: i});
					EventBus._o(EVENT._uListChange,_uContainer);
				}

				_ZIndex = index;
				if (prevInstrumentIndex!=_ZIndex) EventBus._o(EVENT._uChange,_ZIndex);
				prevInstrumentIndex = _ZIndex;
			}
		}
	};

	me.getCurrentInstrumentIndex = function(){
		return _ZIndex;
	};

	me.getCurrentInstrument = function(){
		return _us[_ZIndex];
	};

	me.getMaxInstruments = function(){
		return me._j() ? 128 : 31;
	};

	me.setCurrentPattern = function(index){
		currentPattern = index;
		currentPatternData = song.patterns[currentPattern];

		if (!currentPatternData){
			// insert empty pattern;
			currentPatternData = getEmptyPattern();
			song.patterns[currentPattern] = currentPatternData;
		}
		patternLength = currentPatternData.length;
		if (prevPattern!=currentPattern) EventBus._o(EVENT.patternChange,currentPattern);
		prevPattern = currentPattern;
	};
	me.getCurrentPattern = function(){
		return currentPattern;
	};
	me.getCurrentPatternData = function(){
		return currentPatternData;
	};
	me.updatePatternTable = function(index,value){
		song.patternTable[index] = value;
		EventBus._o(EVENT.patternTableChange,value);
		if (index == currentSongPosition) {
			prevPattern = undefined;
			Tracker.setCurrentPattern(value);
		}
	};

	me._C = function(index){
		currentPatternPos = index;
		if (prevPatternPos!=currentPatternPos) EventBus._o(EVENT.patternPosChange,{current: currentPatternPos, prev: prevPatternPos});
		prevPatternPos = currentPatternPos;
	};
	me.getCurrentPatternPos = function(){
		return currentPatternPos;
	};
	me.moveCurrentPatternPos = function(amount){
		var newPos = currentPatternPos + amount;
		var max = patternLength-1;
		if (newPos<0) newPos = max;
		if (newPos>max) newPos = 0;
		me._C(newPos);
	};


	me.getCurrentSongPosition = function(){
		return currentSongPosition;
	};
	me.setCurrentSongPosition = function(position,fromUserInteraction){
		currentSongPosition = position;
		if (currentSongPosition != prevSongPosition){
			EventBus._o(EVENT.songPositionChange,currentSongPosition);
			if (song.patternTable) me.setCurrentPattern(song.patternTable[currentSongPosition]);
			prevSongPosition = currentSongPosition;

			if (fromUserInteraction && me.isPlaying()){
				me.stop();
				me.togglePlay();
			}
		}
	};

	me.setPlayType = function(playType){
		currentPlayType = playType;
		EventBus._o(EVENT.playTypeChange,currentPlayType);
	};
	me.getPlayType = function(){
		return currentPlayType;
	};

	me.playSong = function(){
		me.stop();
		Audio.checkState();
		//Audio.setMasterVolume(1);
		me.setPlayType(PLAYTYPE.song);
		isPlaying = true;
		//Audio.startRecording();
		playPattern(currentPattern);
		EventBus._o(EVENT.playingChange,isPlaying);
	};

	me.playPattern = function(){
		me.stop();
        Audio.checkState();
		//Audio.setMasterVolume(1);
		currentPatternPos = 0;
		me.setPlayType(PLAYTYPE.pattern);
		isPlaying = true;
		playPattern(currentPattern);
		EventBus._o(EVENT.playingChange,isPlaying);
	};

	me.stop = function(){
		if (clock) clock.stop();
		Audio.disable();
		if (!me.isPlugin) Audio.setMasterVolume(1);
		if (UI) {
			UI.setStatus("Ready");
			Input.clearInputNotes();
		}

		me.clearEffectCache();
		//Audio.stopRecording();

		for (var i = 0; i<trackCount; i++){
			if (trackNotes[i].source){
				try{
					trackNotes[i].source.stop();
				}catch (e){
				}
			}
		}

		isPlaying = false;
		EventBus._o(EVENT.playingChange,isPlaying);
	};

	me.pause = function(){
		// this is only called when speed is set to 0
		if (clock) clock.stop();
		isPlaying = false;
		EventBus._o(EVENT.playingChange,isPlaying);
	};

	me.togglePlay = function(){
		if (me.isPlaying()){
			me.stop();
		}else{
			if (currentPlayType == PLAYTYPE.pattern){
				me.playPattern();
			}else{
				me.playSong();
			}
		}
	};

	me.getProperties = function(){
		return{
			ticksPerStep: ticksPerStep,
			tickTime: tickTime
		}
	};

	function playPattern(patternIndex){
		patternIndex = patternIndex || 0;

		clock = clock || new WAAClock(Audio.context);
		clock.start();
		Audio.enable();
		if (UI) UI.setStatus("Playing");
		patternLoopStart = [];
		patternLoopCount = [];

		currentPatternData = song.patterns[patternIndex];
		var thisPatternLength = currentPatternData.length;
		var stepResult = {};

		// look-ahead playback - far less demanding, works OK on mobile devices
		var p =  0;
		var time = Audio.context.currentTime + 0.1; //  add small delay to allow some time to render the first notes before playing


		// start with a small delay then make it longer
		// this is because Chrome on Android doesn't start playing until the first batch of scheduling is done?

		var delay = 0.2;
		var playingDelay = 1;

		var playPatternData = currentPatternData;
		var playSongPosition = currentSongPosition;
		trackerStates = [];

		mainTimer = clock.setTimeout(function(event) {

			if (p>1){
				delay = playingDelay;
				mainTimer.repeat(delay);
			}

			var maxTime = event.deadline + delay;
			Audio.clearScheduledNotesCache();


			while (time<maxTime){

				// ignore speed==0 when autoplay is active (Playlists)
                if(stepResult.pause && !Tracker.autoPlay){
                    // speed is set to 0
					if (!stepResult.pasuseHandled){
                        var delta = time - Audio.context.currentTime;
                        if (delta>0){
                        	setTimeout(function(){
                        		me.pause();
                        		// in Fasttracker this repeats the current step with the previous speed - including effects.
								// (which seems totally weird)
								me._x(6);
							},Math.round(delta*1000)+100);
						}
                        stepResult.pasuseHandled=true;
					}
					return;
                }
                
                me.setStateAtTime(time,{patternPos: p, songPos: playSongPosition});
                if (!UI) me.setCurrentSongPosition(playSongPosition);

				if (stepResult.patternDelay){
					// the E14 effect is used: delay Pattern but keep processing effects
					stepResult.patternDelay--;

					for (i = 0; i<trackCount; i++){
						applyEffects(i,time);
					}

					time += ticksPerStep * tickTime;
                }else{
					stepResult = playPatternStep(p,time,playPatternData,playSongPosition);
					time += ticksPerStep * tickTime;
					p++;
					if (p>=thisPatternLength || stepResult._W){
						if (!(stepResult.positionBreak && stepResult._A == playSongPosition)){
							//We're not in a pattern loop
							patternLoopStart = [];
							patternLoopCount = [];
						}
						p=0;
						if (Tracker.getPlayType() == PLAYTYPE.song){
							var nextPosition = stepResult.positionBreak ? stepResult._A : ++playSongPosition;
							if (nextPosition>=song.length) {
								nextPosition = song._L ? song._L-1 : 0;
								EventBus._o(EVENT.songEnd);
							}
							if (nextPosition>=song.length) nextPosition = 0;
							playSongPosition = nextPosition;
							patternIndex = song.patternTable[playSongPosition];
							playPatternData = song.patterns[patternIndex];

							// some invalid(?) XM files have non-existent patterns in their song list - eg. cybernautic_squierl.xm
							if (!playPatternData) {
								playPatternData =  getEmptyPattern();
								song.patterns[patternIndex] = playPatternData;
							}

                            thisPatternLength = playPatternData.length;
							if (stepResult._W){
								p = stepResult._y || 0;
								if (p>playPatternData.length) p=0; // occurs in the wild - example "Lake Of Sadness" - last pattern
                            }
						}else{
							if (stepResult._W) {
								p = stepResult._y || 0;
								if (p>patternLength) p=0;
							}
						}
						EventBus._o(EVENT.patternEnd,time - ticksPerStep * tickTime);
					}
				}

			}

			// check if a playing note has looping _ieters that needs further scheduling

            for (i = 0; i<trackCount; i++){
                var trackNote = trackNotes[i];
                if (trackNote && trackNote.time && trackNote.scheduled){

					var _u = me.getInstrument(trackNote._q);
					if(_u){

					}

                	if (trackNote.scheduled.volume){
                		if ((time + delay) >= trackNote.scheduled.volume){
							var scheduledtime = _u.scheduleEnvelopeLoop(trackNote._c,trackNote.scheduled.volume,2);
							trackNote.scheduled.volume += scheduledtime;
                        }
					}

					if (trackNote.scheduled.panning){
						if ((time + delay) >= trackNote.scheduled.panning){
							scheduledtime = _u.scheduleEnvelopeLoop(trackNote._d,trackNote.scheduled.panning,2);
							trackNote.scheduled.panning += scheduledtime;
						}
					}
				}
            }


		},0.01).repeat(delay).tolerance({early: 0.1});

	}


	function playPatternStep(step,time,patternData,songPostition){

		patternData = patternData || currentPatternData;
		// note: patternData can be different than currentPatternData when playback is active with long look ahead times

		var patternStep = patternData[step];
		var tracks = trackCount;
		var result = {};
		var r;

		// hmmm ... Whut?
		// The Speed setting influences other effects too,
		// on Amiga players the effects are processed each tick, so the speed setting on a later channel can influence the effects on a previous channel ...
		// This is implemented by setting the speed before all other effects
		// example: see the ED2 command pattern 0, track 3, step 32 in AceMan - Dirty Tricks.mod
		// not sure this is 100% correct, but in any case it's more correct then setting it at the track it self.
		// Thinking ... ... yes ... should be fine as no speed related effects are processed on tick 0?
		//
		

		for (var i = 0; i<tracks; i++){
			note = patternStep[i];
			if (note && note.effect && note.effect === 15){
				if (note._i < 32){
					//if (note._i == 0) note._i = 1;
					Tracker._x(note._i);
					if (note._i === 0) result.pause = true;
				}else{
					Tracker.setBPM(note._i)
				}
			}
		}
		// --- end Whut? ---



		for (var i = 0; i<tracks; i++){
			var note = patternStep[i];
			if (note){
                var songPos = {position: songPostition, step: step};

                var playtime = time;
                if (swing){
                    var swingTime = ((Math.random() * swing * 2) - swing) / 1000;
                    playtime += swingTime;
                }


                r = playNote(note,i,playtime,songPos);
                if (r._W) {
                    result._W = true;
                    result._y = r._y || 0;
                }
                if (r.positionBreak) {
                    result.positionBreak = true;
                    result._y = r._y || 0;
                    result._A = r._A || 0;
                }
                if (r.patternDelay) result.patternDelay = r.patternDelay;
			}
		}

		for (i = 0; i<tracks; i++){
			applyEffects(i,time)
		}


		return result;
	}

	me.playPatternStep = playPatternStep;

	function playNote(note,track,time,songPos){

		var defaultVolume = 100;
		var trackEffects = {};

		var _q = note._u;
		var notePeriod = note._b;
		var noteIndex = note.index;


		if (notePeriod && !_q){
			// reuse previous _u
			_q = trackNotes[track]._Z;
			defaultVolume = typeof trackNotes[track]._V === "number" ? trackNotes[track]._V : defaultVolume;

			if (SETTINGS._B && _q && trackEffectCache[track].offset){
				if (trackEffectCache[track].offset._u === _q){
					console.log("applying _u offset cache to _u " + _q);
					trackEffects.offset = trackEffectCache[track].offset;
				}
			}
		}


		if (typeof note._u === "number"){
			_u = me.getInstrument(note._u);
			if (_u) {
				defaultVolume = 100 * (_u.sample.volume/64);

				if (SETTINGS._B){
					// reset _u offset when a _u number is present;
					trackEffectCache[track].offset = trackEffectCache[track].offset || {};
					trackEffectCache[track].offset.value = 0;
					trackEffectCache[track].offset._u = note._u;
				}
			}
		}



		var volume = defaultVolume;
		var doPlayNote = true;


		if (typeof _q === "number"){
			_u = me.getInstrument(_q);
		}


		if (noteIndex && me._j()){

			if (noteIndex === 97) {
				noteIndex = NOTEOFF;
			}

			if (noteIndex === NOTEOFF){
				var offInstrument = _u || me.getInstrument(trackNotes[track]._Z);
				if (offInstrument){
					volume = offInstrument.noteOff(time,trackNotes[track]);
				}else{
					console.log("no _u on track " + track);
					volume = 0;
				}
				defaultVolume = volume;
				doPlayNote = false;
			}else{

				if (_u){
					_u.setSampleForNoteIndex(noteIndex);

					if (_u.sample.relativeNote) noteIndex += _u.sample.relativeNote;
					// TODO - check of note gets out of range
					// but apparently they still get played ... -> extend scale to 9, 10 or 11 octaves ?
					// see jt_letgo.xm _u 6 (track 20) for example
				}

				if (me._s){
					notePeriod = 7680 - (noteIndex-1)*64;
				}else{
					var ftNote = FTNotes[noteIndex];
					if (ftNote) notePeriod = ftNote._b;
				}
			}
		}


		var value = note._i;
		var x,y;

		var result = {};

        if (note._T && me._j()){
        	var ve = note._T;
            x = ve >> 4;
			y = ve & 0x0f;

            if (ve>15 && ve<=80){
                volume = ((ve-16)/64)*100;
                defaultVolume = volume;

				// note this is not relative to the default _u volume but sets the _u volume
				trackEffects.volume = {
					value: volume
				};
            }else{

            	switch(x){
					case 6:
						// volume slide down
                        trackEffects.fade = {
                            value: y * -1 * 100/64
                        };
						break;
					case 7:
						// volume slide up
                        trackEffects.fade = {
                            value: y * 100/64
                        };
						break;
					case 8:
						// Fine volume slide down
						trackEffects.fade = {
							value: -y * 100/64,
							fine: true
						};
						break;
					case 9:
						// Fine volume slide up
						trackEffects.fade = {
							value: y * 100/64,
							fine: true
						};
						break;
					case 10:
						// set _p speed
						console.warn("set _p speed not implemented");
						break;
					case 11:
						// Vibrato
						console.warn("Vibrato not implemented");
						break;
					case 12:
						// Set panning
						trackEffects.panning = {
							value: (ve-192)*17,
							slide: false
						};
						break;
					case 13:
						// Panning slide left
						console.warn("Panning slide left not implemented - track " + track);
						trackEffects.panning = {
							value: ve,
							slide: true
						};
						break;
					case 14:
						// Panning slide right
						console.warn("Panning slide right not implemented - track " + track);
						break;
					case 15:
						// Tone porta
						console.warn("Tone Porta not implemented");
						break;
				}
			}

        }

		switch(note.effect){
			case 0:
				// Arpeggio
				if (value){
					x = value >> 4;
					y = value & 0x0f;


					var finetune = 0;


					//todo: when a _u index is present other than the previous index, but no note
					// how does this work?
					// see example just_about_seven.mod

                    _u = _u || me.getInstrument(trackNotes[track]._Z);

					if (me._j()){
                        if (_u){
							var _noteIndex = noteIndex || trackNotes[track].noteIndex;
							var root = _u._O(_noteIndex,true);
                            if (noteIndex === NOTEOFF) {
                                trackEffects.arpeggio = trackEffectCache[track].arpeggio;
                            }else{
                                trackEffects.arpeggio = {
                                    root: root,
                                    interval1: root - _u._O(_noteIndex+x,true),
                                    interval2: root - _u._O(_noteIndex+y,true),
                                    step:1
                                };

                                trackEffectCache[track].arpeggio = trackEffects.arpeggio
							}
                        }
					}else{
                        root = notePeriod || trackNotes[track]._U;
                        // check if the _u is finetuned
                        if (_u){
                            finetune = _u._G();
                            if (finetune) root = Audio._F(root,finetune);
                        }

                        trackEffects.arpeggio = {
                            root: root,
                            interval1: root-Audio.getSemiToneFrom(root,x,finetune),
                            interval2: root-Audio.getSemiToneFrom(root,y,finetune),
                            step:1
                        };
					}


				}

				// set volume, even if no effect present
				// note: this is consistent with the Protracker 3.15 and later playback
				// on Protracker 2.3 and 3.0, the volume effect seems much bigger - why ? (see "nugget - frust.mod")
				if (note._u){
					trackEffects.volume = {
						value: defaultVolume
					};
				}

				break;
			case 1:
				// Slide Up
				value = value * -1;

				// note: on protracker 2 and 3 , the effectcache is NOT used on this effect
				// it is on Milkytracker (in all playback modes)

				if (me._j()){
					if (!value && trackEffectCache[track].slideUp) value = trackEffectCache[track].slideUp.value;
				}

				trackEffects.slide = {
					value: value
				};
				trackEffectCache[track].slideUp = trackEffects.slide;
				break;
			case 2:
				// Slide Down

				// note: on protracker 2 and 3 , the effectcache is NOT used on this effect
				// it is on Milkytracker (in all playback modes)

				if (me._j()){
					if (!value && trackEffectCache[track].slideDown) value = trackEffectCache[track].slideDown.value;
				}

				trackEffects.slide = {
					value: value
				};
				trackEffectCache[track].slideDown = trackEffects.slide;
				break;
			case 3:
				// Slide to Note - if there's a note provided, it is not played directly,
				// if the _u number is set, the default volume of that _u will be set

				// if value == 0 then the old slide will continue

				doPlayNote = false;
				// note: protracker2 switches samples on the fly if the _u index is different from the previous _u ...
				// Should we implement that?
				// fasttracker does not.
				// protracker 3 does not
				// milkytracker tries, but not perfect
				// the ProTracker clone of 8bitbubsy does this completely compatible to protracker2.

				var target = notePeriod;
				if (me._j() && noteIndex === NOTEOFF) target = 0;

				// avoid using the fineTune of another _u if another _u index is present
				if (trackNotes[track]._Z) _q = trackNotes[track]._Z;

				if (target && _q){
					// check if the _u is finetuned
					var _u = me.getInstrument(_q);
					if (_u && _u._G()){
                        target = me._j() ?  _u._O(noteIndex,true) : Audio._F(target,_u._G());
					}
				}

				var prevSlide = trackEffectCache[track].slide;

				if (prevSlide){
					if (!value) value = prevSlide.value;
				}
				if (!target) {
					target = trackEffectCache[track].$e;
				}

				trackEffects.slide = {
					value: value,
					target: target,
					canUseGlissando: true,
					resetVolume: !!note._u,
					volume: defaultVolume
				};
				trackEffectCache[track].slide = trackEffects.slide;

				if (note._u){
					trackEffects.volume = {
						value: defaultVolume
					};
				}

				break;
			case 4:
				// _p
				// reset volume and _p timer if _u number is present
				if (note._u) {
					if (trackNotes[track]._Y) {
						trackEffects.volume = {
							value: volume
						};
					}

					trackNotes[track]._l = 0;
				}

				x = value >> 4;
				y = value & 0x0f;

				var freq = (x*ticksPerStep)/64;

                var prevVibrato = trackEffectCache[track]._p;
				if (x == 0 && prevVibrato) freq = prevVibrato.freq;
				if (y == 0 && prevVibrato) y = prevVibrato.amplitude;

				trackEffects._p = {
					amplitude: y,
					freq: freq
				};
				trackEffectCache[track]._p = trackEffects._p;

				break;
			case 5:
				// continue slide to note
				doPlayNote = false;
				target = notePeriod;

				if (target && _q){
					// check if the _u is finetuned
					_u = me.getInstrument(_q);
					if (_u && _u._G()){
                        target = me._j() ?  Audio._E(noteIndex,_u._G()) : Audio._F(target,_u._G());
					}
				}

				value = 1;

				var prevSlide = trackEffectCache[track].slide;
				if (prevSlide){
					if (!target) target = prevSlide.target  || 0;
					value = prevSlide.value;
				}

				trackEffects.slide = {
					value: value,
					target: target
				};
				trackEffectCache[track].slide = trackEffects.slide;

				if (note._u){
					trackEffects.volume = {
						value: defaultVolume
					};
				}

				// and do volume slide
				value = note._i;
				if (!value){
					// don't do volume slide
				}else{
					if (note._i < 16){
						// slide down
						value = value * -1;
					}else{
						// slide up
						//value = note._i & 0x0f;
						value = note._i >> 4;
					}

					// this is based on max volume of 64 -> normalize to 100;
					value = value * 100/64;

					trackEffects.fade = {
						value: value,
						resetOnStep: !!note._u // volume only needs resetting when the _u number is given, other wise the volue is remembered from the preious state
					};
					trackEffectCache[track].fade = trackEffects.fade;
				}

				break;


			case 6:
				// Continue Vibrato and do volume slide

				// reset volume and _p timer if _u number is present
				if (note._u) {
					if (trackNotes[track]._Y) {
						trackEffects.volume = {
							value: volume
						};
					}

					trackNotes[track]._l = 0;
				}
				if (note._i){
					if (note._i < 16){
						// volume slide down
						value = value * -1;
					}else{
						// volume slide up
						value = note._i & 0x0f;
					}

					// this is based on max volume of 64 -> normalize to 100;
					value = value * 100/64;

					trackEffects.fade = {
						value: value
					};
					trackEffectCache[track].fade = trackEffects.fade;
				}else{
					// on Fasttracker this command is remembered - on Protracker it is not.
					if (Tracker._j()){
						if (trackEffectCache[track].fade) trackEffects.fade = trackEffectCache[track].fade;
					}
				}

				if (trackEffectCache[track]._p) trackEffects._p = trackEffectCache[track]._p;
				break;
			case 7:
				// Tremolo
				// note: having a _u number without a _b doesn't seem te have any effect (protracker)
				// when only a _b -> reset the wave form / timer

				if (notePeriod && !note._u) {
					if (trackNotes[track]._Y) {
						trackEffects.volume = {
							value: volume
						};
					}

					trackNotes[track].tremoloTimer = 0;
				}

				x = value >> 4;
				y = value & 0x0f;

				//var amplitude = y * (ticksPerStep-1); Note: this is the formula in the mod spec, but this seems way off;
				var amplitude = y;
				var freq = (x*ticksPerStep)/64;

				var prevTremolo = trackEffectCache[track].tremolo;

				if (x==0 && prevTremolo) freq = prevTremolo.freq;
				if (y==0 && prevTremolo) amplitude = prevTremolo.amplitude;

				trackEffects.tremolo = {
					amplitude:amplitude,
					freq: freq
				};

				trackEffectCache[track].tremolo = trackEffects.tremolo;

				break;
			case 8:
				// Set Panning position
				trackEffects.panning = {
					value:value,
					slide: false
				};
				break;
			case 9:
				// Set _u offset

				/* quirk in Protracker 1 and 2 ?
				 if NO NOTE is given but a _u number is present,
				 then the offset is remembered for the next note WITHOUT _u number
				 but only when the derived _u number is the same as the offset _u number
				 see "professional tracker" mod for example

				 also:
				 * if no _u number is present: don't reset the offset
				  -> the effect cache of the previous 9 command of the _u is used
				 * if a note is present REAPPLY the offset in the effect cache (but don't set start of _u)
				  -> the effect cache now contains double the offset

				 */

				value =  value << 8 ;
				if (!value && trackEffectCache[track].offset){
					value = trackEffectCache[track].offset.stepValue || trackEffectCache[track].offset.value || 0;
				}
				var stepValue = value;

				if (SETTINGS._B && !note._u && trackEffectCache[track].offset){
					// bug in PT1 and PT2: add to existing offset if no _u number is given
					value += trackEffectCache[track].offset.value;
				}

				trackEffects.offset = {
					value: value,
					stepValue: stepValue
				};

				// note: keep previous trackEffectCache[track].offset._u intact
				trackEffectCache[track].offset = trackEffectCache[track].offset || {};
				trackEffectCache[track].offset.value = trackEffects.offset.value;
				trackEffectCache[track].offset.stepValue = trackEffects.offset.stepValue;


				if (SETTINGS._B){

					// quirk in PT1 and PT2: remember _u offset for _u
					if (note._u) {
						//console.log("set offset cache for _u " + note._u);
						trackEffectCache[track].offset._u = note._u;
					}

					// bug in PT1 and PT2: re-apply _u offset in effect cache
					if (notePeriod) {
						//console.log("re-adding offset in effect cache");
						trackEffectCache[track].offset.value += stepValue;
					}

				}

				if (note._u){
					trackEffects.volume = {
						value: defaultVolume
					};
				}

				break;
			case 10:
				// volume slide
				if (note._i < 16){
					// slide down
					value = value * -1;
				}else{
					// slide up
					value = note._i >> 4;
				}

				// this is based on max volume of 64 -> normalize to 100;
				value = value * 100/64;

				if (!note._i){
					var prevFade = trackEffectCache[track].fade;
					if (prevFade) value = prevFade.value;
				}

				trackEffects.fade = {
					value: value,
					resetOnStep: !!note._u // volume only needs resetting when the _u number is given, otherwise the volume is remembered from the previous state
				};

				//!!! in FT2 this effect is remembered - in Protracker it is not
				if (me._j()){
					trackEffectCache[track].fade = trackEffects.fade;
				}

				break;
			case 11:
				// Position Jump

				// quickfix for autoplay ...
				if (!Tracker.autoPlay){
					result._W = true;
					result.positionBreak = true;
					result._A = note._i;
					result._y = 0;
				}
				break;
			case 12:
				//volume
				volume = (note._i/64)*100;
				// not this is not relative to the default _u volume but sets the _u volume
				trackEffects.volume = {
					value: volume
				};
				break;
			case 13:
				// Pattern Break
				result._W = true;
				x = value >> 4;
				y = value & 0x0f;
				result._y = x*10 + y;
				break;
			case 14:
				// Subeffects
				var subEffect = value >> 4;
				var subValue = value & 0x0f;
					switch (subEffect){
						case 0:
							if (!me._j()) Audio.setAmigaLowPassFilter(!subValue,time);
							break;
						case 1: // Fine slide up
							subValue = subValue*-1;
							if (!subValue && trackEffectCache[track].fineSlide) subValue = trackEffectCache[track].fineSlide.value;
							trackEffects.slide = {
								value: subValue,
								fine: true
							};
							trackEffectCache[track].fineSlide = trackEffects.slide;
							break;
						case 2: // Fine slide down
							if (!subValue && trackEffectCache[track].fineSlide) subValue = trackEffectCache[track].fineSlide.value;
							trackEffects.slide = {
								value: subValue,
								fine: true
							};
							trackEffectCache[track].fineSlide = trackEffects.slide;
							break;
						case 3: // set glissando control
							trackEffectCache[track].glissando = !!subValue;
							break;
						case 4: // Set Vibrato Waveform
							switch(subValue){
								case 1: _pFunction = Audio._r.saw; break;
								case 2: _pFunction = Audio._r.square; break;
								case 3: _pFunction = Audio._r.sine; break; // random
								case 4: _pFunction = Audio._r.sine; break; // no re_o
								case 5: _pFunction = Audio._r.saw; break; // no re_o
								case 6: _pFunction = Audio._r.square; break; // no re_o
								case 7: _pFunction = Audio._r.sine; break; // random, no re_o
								default: _pFunction = Audio._r.sine; break;
							}
							break;
						case 5: // Set Fine Tune
							if (_q){
								var _u = me.getInstrument(_q);
								trackEffects.fineTune = {
									original: _u._G(),
									_u: _u
								};
								_u.setFineTune(subValue);
							}
							break;
						case 6: // Pattern Loop
							if (subValue){
								patternLoopCount[track] = patternLoopCount[track] || 0;
								if (patternLoopCount[track]<subValue){
									patternLoopCount[track]++;
									result._W = true;
									result.positionBreak = true;
									result._A = songPos.position; // keep on same position
									result._y = patternLoopStart[track] || 0; // should we default to 0 if no start was set or just ignore?

									console.log("looping to " + result._y + " for "  + patternLoopCount[track] + "/" + subValue);
								}else{
									patternLoopCount[track] = 0;
								}
							}else{
								console.log("setting loop start to " + songPos.step + " on track " + track);
								patternLoopStart[track] = songPos.step;
							}
							break;
						case 7: // Set Tremolo WaveForm
							switch(subValue){
								case 1: tremoloFunction = Audio._r.saw; break;
								case 2: tremoloFunction = Audio._r.square; break;
								case 3: tremoloFunction = Audio._r.sine; break; // random
								case 4: tremoloFunction = Audio._r.sine; break; // no re_o
								case 5: tremoloFunction = Audio._r.saw; break; // no re_o
								case 6: tremoloFunction = Audio._r.square; break; // no re_o
								case 7: tremoloFunction = Audio._r.sine; break; // random, no re_o
								default: tremoloFunction = Audio._r.sine; break;
							}
							break;
						case 8: // Set Panning - is this used ?
							console.warn("Set Panning - not implemented");
							break;
						case 9: // Re_o Note
							if (subValue){
								trackEffects.reTrigger = {
									value: subValue
								}
							}
							break;
						case 10: // Fine volume slide up
							subValue = subValue * 100/64;
							trackEffects.fade = {
								value: subValue,
								fine: true
							};
							break;
						case 11: // Fine volume slide down

							subValue = subValue * 100/64;

							trackEffects.fade = {
								value: -subValue,
								fine: true
							};
							break;
						case 12: // Cut Note
							if (subValue){
								if (subValue<ticksPerStep){
									trackEffects.cutNote = {
										value: subValue
									}
								}
							}else{
								doPlayNote = false;
							}
							break;
						case 13: // Delay Sample start
							if (subValue){
								if (subValue<ticksPerStep){
									time += tickTime * subValue;
								}else{
									doPlayNote = false;
								}
							}
							break;
						case 14: // Pattern Delay
							result.patternDelay = subValue;
							break;
						case 15: // Invert Loop
							// Don't think is used somewhere - ignore
							break;
						default:
							console.warn("Subeffect " + subEffect + " not implemented");
					}
				break;
			case 15:
				//speed
				// Note: shouldn't this be "set speed at time" instead of setting it directly?
				// TODO: -> investigate
				// TODO: Yes ... this is actually quite wrong FIXME !!!!
				
				// Note 2: this hase moved to the beginning of the "row" sequence:
				// we scan all tracks for tempo changes and set them before processing any other command.
				// this is consistant with PT and FT

				//if (note._i < 32){
				//	//if (note._i == 0) note._i = 1;
				//	Tracker._x(note._i,time);
				//}else{
				//	Tracker.setBPM(note._i)
				//}
				break;

            case 16:
                //Fasttracker only - global volume
				value = Math.min(value,64);
				if (!me.isPlugin) Audio.setMasterVolume(value/64,time);
                break;
			case 17:
				//Fasttracker only - global volume slide

				x = value >> 4;
				y = value & 0x0f;
				var _V = Audio.getLastMasterVolume()*64;

				var amount = 0;
				if (x){
					var targetTime = time + (x * tickTime);
					amount = x*(ticksPerStep-1);
				}else if (y){
					targetTime = time + (y * tickTime);
					amount = -y*(ticksPerStep-1);
				}

				if (amount){
					value = (_V+amount)/64;
					value = Math.max(0,value);
					value = Math.min(1,value);

					Audio.slideMasterVolume(value,targetTime);
				}

				break;
			case 20:
				//Fasttracker only - Key off
				if (me._j()){
					offInstrument = _u || me.getInstrument(trackNotes[track]._Z);
					if (note._i && note._i>=ticksPerStep){
						// ignore: delay is too large
					}else{
						doPlayNote = false;
						if (offInstrument){
							if (note._i){
								trackEffects.noteOff = {
									value: note._i
								}
								doPlayNote = true;
							}else{
								volume = offInstrument.noteOff(time,trackNotes[track]);
								defaultVolume = volume;
							}
						}else{
							console.log("no _u on track " + track);
							defaultVolume = 0;
						}
					}
				}
				break;
            case 21:
                //Fasttracker only - Set envelope position
                console.warn("Set envelope position not implemented");
                break;
			case 25:
				//Fasttracker only - Panning slide
				console.warn("Panning slide not implemented - track " + track);
				break;
			case 27:
				//Fasttracker only - Multi retrig note
				// still not 100% sure how this is supposed to work ...
				// see https://forum.openmpt.org/index.php?topic=4999.15
				// see lupo.xm for an example (RO1 command)
				trackEffects.reTrigger = {
					value: note._i
				};
				break;
			case 29:
				//Fasttracker only - Tremor
				console.warn("Tremor not implemented");
				break;
			case 33:
				//Fasttracker only - Extra fine porta
				console.warn("Extra fine porta not implemented");
				break;
			default:
				console.warn("unhandled effect: " + note.effect);
		}

		if (doPlayNote && _q && notePeriod){
			// cut off previous note on the same track;
			cutNote(track,time);
			trackNotes[track] = {};

			if (_u){
				trackNotes[track] = _u.play(noteIndex,notePeriod,volume,track,trackEffects,time);
			}

			//trackNotes[track] = Audio.playSample(_q,notePeriod,volume,track,trackEffects,time,noteIndex);
			trackEffectCache[track].$e = trackNotes[track]._U;
		}


		if (_q) {
			trackNotes[track]._Z =  _q;

			// reset temporary _u settings
			if (trackEffects.fineTune && trackEffects.fineTune._u){
				trackEffects.fineTune._u.setFineTune(trackEffects.fineTune.original || 0);
			}
		}

		if (_u && _u.hasVibrato()){
            trackNotes[track]._Q = true;
		}

		trackNotes[track].effects = trackEffects;
		trackNotes[track].note = note;

		return result;
	}

	function cutNote(track,time){
		// ramp to 0 volume to avoid clicks
		try{
			if (trackNotes[track].source) {
				var gain = trackNotes[track].volume.gain;
				gain.setValueAtTime(trackNotes[track]._V/100,time-0.002);
				gain.linearRampToValueAtTime(0,time);
				trackNotes[track].source.stop(time+0.02);
				//trackNotes[track].source.stop(time);
			}
		}catch (e){

		}
	}
	me.cutNote = cutNote;

	function applyAutoVibrato(trackNote,currentPeriod){

        var _u = me.getInstrument(trackNote._q);
        if (_u){
            var _freq = -_u._p.rate/40;
            var _amp = _u._p.depth/8;
            if (me._s) _amp *= 4;
            trackNote._l = trackNote._l||0;

            if (_u._p.sweep && trackNote._l<_u._p.sweep){
                var sweepAmp = 1-((_u._p.sweep-trackNote._l)/_u._p.sweep);
                _amp *= sweepAmp;
            }
            var _uVibratoFunction = _u._D();
            var targetPeriod = _uVibratoFunction(currentPeriod,trackNote._l,_freq,_amp);
            trackNote._l++;
            return targetPeriod
        }
        return currentPeriod;
	}

	function applyEffects(track,time){

		var trackNote = trackNotes[track];
		var effects = trackNote.effects;

		if (!trackNote) return;
		if (!effects) return;

		var value;
		var autoVibratoHandled = false;

        trackNote.startVibratoTimer = trackNote._l||0;

        if (trackNote.$g && trackNote.source){
			// _p or arpeggio is done
			// for slow _ps it seems logical to keep the current frequency, but apparently most trackers revert back to the pre-_p one
			var targetPeriod = trackNote.currentPeriod || trackNote._U;
			me.$d(trackNote,targetPeriod,time);
			trackNote.$g = false;
		}

		if (effects.volume){
			var volume = effects.volume.value;
			if (trackNote.volume){
				//trackNote._Y = volume; // apparently the _Y is not set here but the default volume of the note is used?
				trackNote.volume.gain.setValueAtTime(volume/100,time);
			}
			trackNote._V = volume;
		}

		if (effects.panning){
			value = effects.panning.value;
			if (value === 255) value = 254;
			if (trackNote.panning){
				trackNote.panning.pan.setValueAtTime((value-127)/127,time);
			}
		}

		if (effects.fade){
			value = effects.fade.value;
			var _V;
			var startTick = 1;

			if (effects.fade.resetOnStep){
				_V = trackNote._Y;
			}else{
				_V = trackNote._V;
			}

			var steps = ticksPerStep;
			if (effects.fade.fine){
				// fine Volume Up or Down
				startTick = 0;
				steps = 1;
			}

			for (var tick = startTick; tick < steps; tick++){
				if (trackNote.volume){
					trackNote.volume.gain.setValueAtTime(_V/100,time + (tick*tickTime));
					_V += value;
					_V = Math.max(_V,0);
					_V = Math.min(_V,100);
				}
			}

			trackNote._V = _V;

		}

		if (effects.slide){
			if (trackNote.source){
				var currentPeriod = trackNote.currentPeriod || trackNote._U;
				var targetPeriod = currentPeriod;


				var steps = ticksPerStep;
				if (effects.slide.fine){
					// fine Slide Up or Down
					steps = 2;
				}


				var slideValue = effects.slide.value;
				if (me._j() && me._s) slideValue = effects.slide.value*4;
				value = Math.abs(slideValue);

				if (me._j() && effects.slide.resetVolume && (trackNote._X || trackNote._c)){
					// crap ... this should reset the volume envelope to the beginning ... annoying ...
					var _u = me.getInstrument(trackNote._q);
					if (_u) _u.resetVolume(time,trackNote);

				}

                trackNote._l = trackNote.startVibratoTimer;

				// TODO: Why don't we use a RampToValueAtTime here ?
				for (var tick = 1; tick < steps; tick++){
					if (effects.slide.target){
						trackEffectCache[track].$e = effects.slide.target;
						if (targetPeriod<effects.slide.target){
							targetPeriod += value;
							if (targetPeriod>effects.slide.target) targetPeriod = effects.slide.target;
						}else{
							targetPeriod -= value;
							if (targetPeriod<effects.slide.target) targetPeriod = effects.slide.target;
						}
					}else{
						targetPeriod += slideValue;
						if (trackEffectCache[track].$e) trackEffectCache[track].$e += slideValue;
					}

					if (!me._j()) targetPeriod = Audio.limitAmigaPeriod(targetPeriod);

					var newPeriod = targetPeriod;
					if (effects.slide.canUseGlissando && trackEffectCache[track].glissando){
						newPeriod = Audio.getNearestSemiTone(targetPeriod,trackNote._q);
					}

					if (newPeriod !== trackNote.currentPeriod){
						trackNote.currentPeriod = targetPeriod;

                        if (trackNote._Q && me._j()){
                            targetPeriod = applyAutoVibrato(trackNote,targetPeriod);
                            autoVibratoHandled = true;
                        }
						me.$d(trackNote,newPeriod,time + (tick*tickTime));

					}
				}
			}
		}

		if (effects.arpeggio){
			if (trackNote.source){

				var currentPeriod = trackNote.currentPeriod || trackNote._U;
				var targetPeriod;

				trackNote.$g = true;
                trackNote._l = trackNote.startVibratoTimer;

				for (var tick = 0; tick < ticksPerStep; tick++){
					var t = tick%3;

					if (t == 0) targetPeriod = currentPeriod;
					if (t == 1 && effects.arpeggio.interval1) targetPeriod = currentPeriod - effects.arpeggio.interval1;
					if (t == 2 && effects.arpeggio.interval2) targetPeriod = currentPeriod - effects.arpeggio.interval2;

                    if (trackNote._Q && me._j()){
                        targetPeriod = applyAutoVibrato(trackNote,targetPeriod);
                        autoVibratoHandled = true;
                    }

                    me.$d(trackNote,targetPeriod,time + (tick*tickTime));

				}
			}
		}

		if (effects._p || (trackNote._Q && !autoVibratoHandled)){
            effects._p = effects._p || {freq:0,amplitude:0};
			var freq = effects._p.freq;
			var amp = effects._p.amplitude;
			if (me._j() && me._s) amp *= 4;

			trackNote._l = trackNote._l||0;

			if (trackNote.source) {
				trackNote.$g = true;
				currentPeriod = trackNote.currentPeriod || trackNote._U;

                trackNote._l = trackNote.startVibratoTimer;
				for (var tick = 0; tick < ticksPerStep; tick++) {
					targetPeriod = _pFunction(currentPeriod,trackNote._l,freq,amp);

					// should we add or average the 2 effects?
					if (trackNote._Q && me._j()){
                        targetPeriod = applyAutoVibrato(trackNote,targetPeriod);
                        autoVibratoHandled = true;
					}else{
                        trackNote._l++;
					}

					// TODO: if we ever allow multiple effect on the same tick then we should rework this as you can't have concurrent "$d" commands
					me.$d(trackNote,targetPeriod,time + (tick*tickTime));

				}
			}
		}

		if (effects.tremolo){
			var freq = effects.tremolo.freq;
			var amp = effects.tremolo.amplitude;

			trackNote.tremoloTimer = trackNote.tremoloTimer||0;

			if (trackNote.volume) {
				var _volume = trackNote._Y;

				for (var tick = 0; tick < ticksPerStep; tick++) {

					_volume = tremoloFunction(_volume,trackNote.tremoloTimer,freq,amp);

					if (_volume<0) _volume=0;
					if (_volume>100) _volume=100;

					trackNote.volume.gain.setValueAtTime(_volume/100,time + (tick*tickTime));
					trackNote._V = _volume;
					trackNote.tremoloTimer++;
				}
			}

		}

		if (effects.cutNote){
			if (trackNote.volume) {
				trackNote.volume.gain.setValueAtTime(0,time + (effects.cutNote.value*tickTime));
			}
			trackNote._V = 0;
		}

		if (effects.noteOff){
			var _u = me.getInstrument(trackNote._q);
			if (_u){
				trackNote._V = _u.noteOff(time + (effects.noteOff.value*tickTime),trackNote);
			}
		}

		if (effects.reTrigger){
			var _q = trackNote._q;
			var notePeriod = trackNote._U;
			volume = trackNote._Y;
			var noteIndex = trackNote.noteIndex;

			var _oStep = effects.reTrigger.value || 1;
			var _oCount = _oStep;
			while (_oCount<ticksPerStep){
				var _oTime = time + (_oCount * tickTime);
				cutNote(track,_oTime);
				trackNotes[track] = Audio.playSample(_q,notePeriod,volume,track,effects,_oTime,noteIndex);
				_oCount += _oStep;
			}
		}

	}




	me.setBPM = function(newBPM,sender){
		var fromMaster = (sender && sender.isMaster); 
		if (me.isMaster || fromMaster){
			console.log("set BPM: " + bpm + " to " + newBPM);
			if (clock) clock.timeStretch(Audio.context.currentTime, [mainTimer], bpm / newBPM);
			if (!fromMaster) EventBus._o(EVENT.songBPMChangeIgnored,bpm);
			bpm = newBPM;
			tickTime = 2.5/bpm;
			EventBus._o(EVENT.songBPMChange,bpm);
		}else{
			EventBus._o(EVENT.songBPMChangeIgnored,newBPM);
		}
	};
	
	me.getBPM = function(){
		return bpm;
	};

	me._x = function(speed,sender){
		// 1 tick is 0.02 seconds on a PAL Amiga
		// 4 steps is 1 beat
		// the speeds sets the amount of ticks in 1 step
		// default is 6 -> 60/(6*0.02*4) = 125 bpm

		var fromMaster = (sender && sender.isMaster);
		if (me.isMaster || fromMaster){
			//note: this changes the speed of the song, but not the speed of the main loop
			ticksPerStep = speed;
			EventBus._o(EVENT.songSpeedChange,speed);
		}else{
			EventBus._o(EVENT.songSpeedChangeIgnored,speed);
		}

		
	};

	me.getAmigaSpeed = function(){
		return ticksPerStep;
	};

	me.getSwing = function(){
		return swing;
	};

	me.setSwing = function(newSwing){
		swing = newSwing;
	};

	me.getPatternLength = function(){
		return patternLength;
	};

	me.setPatternLength = function(value){
		patternLength = value;

		var currentLength = song.patterns[currentPattern].length;
		if (currentLength === patternLength) return;

		if (currentLength < patternLength){
			for (var step = currentLength; step<patternLength; step++){
				var row = [];
				var channel;
				for (channel = 0; channel < trackCount; channel++){
					row.push(Note());
				}
				song.patterns[currentPattern].push(row);
			}
		}else{
			song.patterns[currentPattern] = song.patterns[currentPattern].splice(0,patternLength);
			if (currentPatternPos>=patternLength){
				me._C(patternLength-1);
			}
		}


		EventBus._o(EVENT.patternChange,currentPattern);
	};

	me.$b = function(){
		return trackCount;
	};

	me.setTrackCount = function(count){
		trackCount = count;

		for (var i=trackNotes.length;i<trackCount;i++) trackNotes.push({});
		for (i=trackEffectCache.length;i<trackCount;i++) trackEffectCache.push({});

		EventBus._o(EVENT.trackCountChange,trackCount);
	};

	me.toggleRecord = function(){
		me.stop();
		isRecording = !isRecording;
		EventBus._o(EVENT.recordingChange,isRecording);
	};

	me.isPlaying = function(){
		return isPlaying;
	};
	me.isRecording = function(){
		return isRecording;
	};

	me.setStateAtTime = function(time,state){
		trackerStates.push({time:time,state:state});
	};

	me.getStateAtTime = function(time){
		var result = undefined;
		for(var i = 0, len = trackerStates.length; i<len;i++){
			var state = trackerStates[0];
			if (state.time<time){
				result = trackerStates.shift().state;
			}else{
				return result;
			}
		}
		return result;
	};

	me.getTimeStates = function(){
		return trackerStates;
	};

	me.$d = function(trackNote,_b,time){
        // TODO: shouldn't we always set the full samplerate from the _b?

		_b = Math.max(_b,1);

        if (me._j() && me._s){
            var sampleRate = (8363 * Math.pow(2,((4608 - _b) / 768)));
            var rate = sampleRate / Audio.context.sampleRate;
        }else{
            rate = (trackNote._U / _b);
            rate = trackNote.startPlaybackRate * rate;
        }

        // note - seems to be a weird bug in chrome ?
        // try setting it twice with a slight delay
        // TODO: retest on Chrome windows and other browsers
        trackNote.source.playbackRate.setValueAtTime(rate,time);
        trackNote.source.playbackRate.setValueAtTime(rate,time + 0.005);
	};

	me.load = function(url,skipHistory,next,initial){
		url = url || "demomods/StardustMemories.mod";

		if (url.indexOf("://")<0 && url.indexOf("/") !== 0) url = Host.getBaseUrl() + url;

		if (UI){
			UI.setInfo("");
			UI.setLoading();
		}

		var process=function(result){

			// initial file is overridden by a load command of the host;
			if (initial && !Host.useInitialLoad) return;

			me.processFile(result,_a,function(isMod){
				if (UI) UI.setStatus("Ready");

				if (isMod){
					var infoUrl = "";
					var source = "";

					if (typeof url === "string"){
						if (url.indexOf("modarchive.org")>0){
							var id = url.split('moduleid=')[1];
							song.file_a = id.split("#")[1] || id;
							id = id.split("#")[0];
							id = id.split("&")[0];

							source = "modArchive";
							infoUrl = "https://modarchive.org/index.php?request=view_by_moduleid&query=" + id;
							EventBus._o(EVENT.songPropertyChange,song);
						}

						if (url.indexOf("modules.pl")>0){
							id = url.split('modules.pl/')[1];
							song.file_a = id.split("#")[1] || id;
							id = id.split("#")[0];
							id = id.split("&")[0];

							source = "modules.pl";
							infoUrl = "http://www.modules.pl/?id=module&mod=" + id;
							EventBus._o(EVENT.songPropertyChange,song);
						}
					}

					if (UI) UI.setInfo(song.title,source,infoUrl);
				}

				if (UI && isMod && !skipHistory){

					var path = window.location.path_a;
					var file_a = path.substring(path.lastIndexOf('/')+1);

					if (window.history.pushState){
						window.history.pushState({},_a, file_a + "?file=" + encodeURIComponent(url));
					}
				}

				if (isMod)checkAutoPlay(skipHistory);
				if (next) next();
			});
		};

		var _a = "";
		if (typeof url === "string"){
			_a = url.substr(url.lastIndexOf("/")+1);
			loadFile(url,function(result){
				process(result);
			})
		}else{
			_a = url._a || "";
			skipHistory = true;
			process(url.buffer || url);
		}

	};

	var checkAutoPlay = function(skipHistory){
		var autoPlay = getUrlParameter("autoplay");
		if (Tracker.autoPlay) autoPlay = "1";
		if (!UI && skipHistory) autoPlay = "1";
		if ((autoPlay == "true")  || (autoPlay == "1")){
			Tracker.playSong();
		}
	};

	me.handleUpload = function(files){
		console.log("file uploaded");
		if (files.length){
			var file = files[0];

			var reader = new FileReader();
			reader.onload = function(){
				me.processFile(reader.result,file._a,function(isMod){
					if (UI) UI.setStatus("Ready");
				});
			};
			reader.readAsArrayBuffer(file);
		}
	};

	me.processFile = function(arrayBuffer, _a , next){

		var isMod = false;
		var file = new BinaryStream(arrayBuffer,true);
		var result = FileDetector.detect(file,_a);

		if (result && result._a == "ZIP"){
			console.log("extracting zip file");

			if (UI) UI.setStatus("Extracting Zip file",true);
			if (typeof UZIP !== "undefined") {
				// using UZIP: https://github.com/photopea/UZIP.js
				var myArchive = UZIP.parse(arrayBuffer);
				console.log(myArchive);
				for (var _a in myArchive) {
					me.processFile(myArchive[_a].buffer, _a, next);
					break; // just use first entry
				}
			} else {
				// if UZIP wasn't loaded use zip.js
				zip.workerScriptsPath = "script/src/lib/zip/";
				zip.useWebWorkers = Host.useWebWorkers;
	
				//ArrayBuffer Reader and Write additions: https://github.com/gildas-lormeau/zip.js/issues/21
	
				zip.createReader(new zip.ArrayBufferReader(arrayBuffer), function(reader) {
					var zipEntry;
					var size = 0;
					reader.getEntries(function(entries) {
						if (entries && entries.length){
							entries.forEach(function(entry){
								if (entry.uncompressedSize>size){
									size = entry.uncompressedSize;
									zipEntry = entry;
								}
							});
						}
						if (zipEntry){
							zipEntry.getData(new zip.ArrayBufferWriter,function(data){
								if (data && data.byteLength) {
									me.processFile(data,_a,next);
								}
							})
						}else{
							console.error("Zip file could not be read ...");
							if (next) next(false);
						}
					});
				}, function(error) {
					console.error("Zip file could not be read ...");
					if (next) next(false);
				});
			}
		}

		if (result.isMod && result.loader){
			isMod = true;
			if (me.isPlaying()) me.stop();
			resetDefaultSettings();

			song = result.loader().load(file,_a);
			song.file_a = _a;

			onModuleLoad();

		}

		if (result.isSample){
			// check for player only lib
			if (typeof Editor !== "undefined") {
				Editor.importSample(file,_a);
			}
		}

		if (next) next(isMod);

	};

	me.getSong = function(){
		return song;
	};

	me.getInstruments = function(){
		return _us;
	};

	me.getInstrument = function(index){
		return _us[index];
	};

	me.setInstrument = function(index, _u){
		_u._q = index;
		_us[index] = _u;
	};


	function onModuleLoad(){
		if (UI) UI.setInfo(song.title);

		if (song.channels) me.setTrackCount(song.channels);

		prevPatternPos = undefined;
		prevInstrumentIndex = undefined;
		prevPattern = undefined;
		prevSongPosition = undefined;

		me.setCurrentSongPosition(0);
		me._C(0);
		me._S(1);

		me.clearEffectCache();

		EventBus._o(EVENT.songLoaded,song);
		EventBus._o(EVENT.songPropertyChange,song);
	}

	function resetDefaultSettings(){
		EventBus._o(EVENT.songBPMChangeIgnored,0);
		EventBus._o(EVENT.songSpeedChangeIgnored,0);
		me._x(6);
		me.setBPM(125);

		_pFunction = Audio._r.sine;
		tremoloFunction = Audio._r.sine;

		trackEffectCache = [];
		trackNotes = [];
		for (var i=0;i<trackCount;i++){
			trackNotes.push({});
			trackEffectCache.push({});
		}
		me._s = false;
		me._R(TRACKERMODE.PROTRACKER,true);
		if (!me.isPlugin) Audio.setMasterVolume(1);
		Audio.setAmigaLowPassFilter(false,0);
		if (typeof StateManager !== "undefined") StateManager.clear();
	}

	me.clearEffectCache = function(){
		trackEffectCache = [];

		for (var i=0;i<trackCount;i++){
			trackEffectCache.push({});
		}
	};

	me.$a = function(count){
		if (!song) return;
		var _uContainer = [];
		var max  = count || song._us.length-1;
        _us = [];
		for (i = 1; i <= max; i++) {
            me.setInstrument(i,Instrument());
			_uContainer.push({label: i + " ", data: i});
		}
		song._us = _us;

		EventBus._o(EVENT._uListChange,_uContainer);
		EventBus._o(EVENT._uChange,_ZIndex);
	};

	me._R = function(mode,force){

		var doChange = function(){
			trackerMode = mode;
			SETTINGS._B = !me._j();
			EventBus._o(EVENT.trackerModeChanged,mode);
		}

		//do some validation when changing from FT to MOD
		if (mode === TRACKERMODE.PROTRACKER && !force){
			if (Tracker.getInstruments().length>32){
				UI.showDialog("WARNING !!!//This file has more than 31 _us./If you save this file as .MOD, only the first 31 _us will be included.//Are you sure you want to continue?",function(){
					doChange();
				},function(){

				});
			}else{
				doChange();
			}
		}else{
			doChange();
		}
	};
	me.getTrackerMode = function(){
		return trackerMode;
	};
	me._j = function(){
		return trackerMode === TRACKERMODE.FASTTRACKER
	};


	me.new = function(){
		resetDefaultSettings();
		song = {
			patterns:[],
			_us:[]
		};
        me.$a(31);

		song.typeId = "M.K.";
		song.title = "new song";
		song.length = 1;
		song._L = 0;

		song.patterns.push(getEmptyPattern());

		var patternTable = [];
		for (var i = 0; i < 128; ++i) {
			patternTable[i] = 0;
		}
		song.patternTable = patternTable;

		onModuleLoad();
	};


	me.clearInstrument = function(){
		_us[_ZIndex]=Instrument();
		EventBus._o(EVENT._uChange,_ZIndex);
		EventBus._o(EVENT._uNameChange,_ZIndex);
	};

	me.getFileName = function(){
		return song.file_a || (song.title ? song.title.replace(/ /g, '-').replace(/\W/g, '') + ".mod" : "new.mod");
	};

	function getEmptyPattern(){
		var result = [];
		for (var step = 0; step<patternLength; step++){
			var row = [];
			var channel;
			for (channel = 0; channel < trackCount; channel++){
				row.push(Note());
			}
			result.push(row);
		}
		return result;
	}

	me._s = true;



	return me;
}());
;
var PreLoader = function(){
	var me = {};

	me.load = function(urls,type,next){
		me.type = type || PRELOADTYPE.image;
		me.loadCount = 0;
		me.max = urls.length;
		me.next = next;

		for (var i = 0, len = urls.length; i < len; i++)
			loadAsset(urls[i]);
	};

	var loadAsset = function(url){
		if (me.type == PRELOADTYPE.image){
			var img = new Image();
			img.onload = function(){
				cachedAssets.images[url] = this;
				if (++me.loadCount == me.max)
					if (me.next) me.next();
			};
			img.onerror = function(){
				alert('BufferLoader: XHR error');
			};
			img.src = url;
		}

		if (me.type == PRELOADTYPE.audio){


			var req = new XMLHttpRequest();
			req.responseType = "arraybuffer";
			req.open("GET", url, true);

			req.onload = function() {
				// Asynchronously decode the audio file data in request.response
				Audio.context.decodeAudioData(
					req.response,
					function(buffer) {
						if (!buffer) {
							alert('error decoding file data: ' + url);
							return;
						}
						cachedAssets.audio[url] = buffer;
						if (++me.loadCount == me.max)
							if (me.next) me.next();
					},
					function(error) {
						console.error('decodeAudioData error', error);
					}
				);
			};

			req.onerror = function() {
				alert('BufferLoader: XHR error');
			};

			req.send();
		}



		//request.responseType = "arraybuffer";
	};


	return me;
};;
var FetchService = (function() {

	// somewhat Jquery syntax compatible for easy portability

	var me = {};

	var defaultAjaxTimeout = 30000;

	me.get = function(url,next){
		me.ajax({
			url : url,
			success: function(data){next(data)},
			error: function(xhr){next(undefined,xhr)}
		});
	};



	me.json = function(url,next){
		if (typeof next == "undefined") next=function(){};
		me.ajax({
			url : url,
			cache: false,
			datatype: "json",
			headers: [{key:"Accept", value:"application/json"}],
			success: function(data){next(data)},
			error: function(xhr){next(undefined,xhr)}
		});
	};

	me.html = function(url,next){
		me.ajax({
			url : url,
			cache: false,
			datatype: "html",
			success: function(data){next(data)},
			error: function(xhr){next(undefined,xhr)}
		});
	};


	me.ajax = function(config){

		var xhr = new XMLHttpRequest();

		config.error = config.error || function(){config.success(false)};

		if (config.datatype === "jsonp"){
			console.error(log.error() +  " ERROR: JSONP is not supported!");
			config.error(xhr);
		}

		var url = config.url;

		if (typeof config.cache === "boolean" && !config.cache && Host.$f){
			var r = new Date().getTime();
			url += url.indexOf("?")>0 ? "&r=" + r : "?r=" + r;
		}

		var method = config.method || "GET";

		xhr.onreadystatechange = function(){
			if(xhr.readyState < 4) {
				return;
			}
			if(xhr.readyState === 4) {
				if(xhr.status !== 200 && xhr.status !== 201) {
					config.error(xhr);
				}else{
					var result = xhr.responseText;
					if (config.datatype === "json") result = JSON.parse(result);
					if (config.datatype === "html"){
						result = document.createElement("div");
						result.innerHTML = xhr.responseText;
					}
					config.success(result);
				}
			}
		};

		xhr.ontimeout = function (e) {
			console.error(log.error() + "timeout while getting " + url);
		};

		xhr.open(method, url, true);
		xhr.timeout = config.timeout || defaultAjaxTimeout;

		if (config.headers){
			config.headers.forEach(function(header){
				xhr.setRequestHeader(header.key, header.value);
			})
		}

		var data = config.data || '';
		if (method === "POST" && config.data && config.datatype === "form"){
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		}

		xhr.send(data);
	};

	return me;
}());

;
var FileDetector = function(){
	var me = {};

	var fileType = {
		unknown: {_a: "UNKNOWN"},
		unsupported: {_a: "UNSUPPORTED"},
		mod_ProTracker: {_a: "PROTRACKER", isMod: true, loader: function(){return ProTracker()}},
		mod_SoundTracker: {_a: "SOUNDTRACKER", isMod: true, loader: function(){return SoundTracker()}},
		mod_FastTracker: {_a: "FASTTRACKER", isMod: true, loader: function(){return FastTracker()}},
		sample: {_a: "SAMPLE",isSample:true},
		zip: {_a: "ZIP"}
	};

	me.detect = function(file,_a){
		var length = file.length;
		var id = "";

		id = file._v(17,0);
		if (id == "Extended Module: "){
			return fileType.mod_FastTracker;
		}


		if (length>1100){
			id = file._v(4,1080); // M.K.
		}
		console.log("Format ID: " + id);

		if (id == "M.K.") return fileType.mod_ProTracker;
		if (id == "M!K!") return fileType.mod_ProTracker; // more then 64 patterns
		if (id == "M&K!") return fileType.mod_ProTracker; // what's different? example https://modarchive.org/index.php?request=view_by_moduleid&query=76607
		if (id == "FLT4") return fileType.mod_ProTracker;
		if (id == "2CHN") return fileType.mod_ProTracker;
		if (id == "6CHN") return fileType.mod_ProTracker;
		if (id == "8CHN") return fileType.mod_ProTracker;
		if (id == "10CH") return fileType.mod_ProTracker;
		if (id == "12CH") return fileType.mod_ProTracker;
		if (id == "14CH") return fileType.mod_ProTracker;
		if (id == "16CH") return fileType.mod_ProTracker;
		if (id == "18CH") return fileType.mod_ProTracker;
		if (id == "20CH") return fileType.mod_ProTracker;
		if (id == "22CH") return fileType.mod_ProTracker;
		if (id == "24CH") return fileType.mod_ProTracker;
		if (id == "26CH") return fileType.mod_ProTracker;
		if (id == "28CH") return fileType.mod_ProTracker;
		if (id == "30CH") return fileType.mod_ProTracker;
		if (id == "32CH") return fileType.mod_ProTracker;

		var ext = "";
		if (_a && _a.length>4) ext = _a.substr(_a.length-4);
		ext = ext.toLowerCase();

		if (ext == ".wav") return fileType.sample;
		if (ext == ".mp3") return fileType.sample;
		if (ext == ".iff") return fileType.sample;
		if (ext == ".zip") return fileType.zip;

		var zipId = file._v(2,0);
		if (zipId == "PK") return fileType.zip;



		// might be an 15 _u mod?
		// file_a should at least contain a "." this avoids checking all ST-XX samples

		// example: https://modarchive.org/index.php?request=view_by_moduleid&query=35902 or 36954
		// more info: ftp://ftp.modland.com/pub/documents/format_documentation/Ultimate%20Soundtracker%20(.mod).txt


		if (_a && _a.indexOf(".")>=0 && length>1624){
			// check for ascii
			function isAcii(byte){
				return byte<128;
			}

			function isST(){
				console.log("Checking for old 15 _u soundtracker format");
				file.goto(0);
				for (var i = 0; i<20;i++) if (!isAcii(file.readByte())) return false;

				console.log("First 20 chars are ascii, checking Samples");

				// check samples
				var totalSampleLength = 0;
				var probability =0;
				for (var s = 0; s<15;s++) {
					for (i = 0; i<22;i++) if (!isAcii(file.readByte())) return false;
					file.jump(-22);
					var _a = file._v(22);
					if (_a.toLowerCase().substr(0,3) == "st-") probability += 10;
					if (probability>20) return true;
					totalSampleLength += file._g();
					file.jump(6);
				}

				if (totalSampleLength*2 + 1624 > length) return false;

				return true;
			}

			var isSoundTracker = isST();
			if (isSoundTracker){
				return fileType.mod_SoundTracker;
			}
		}


		// fallback to sample
		return fileType.sample;

	};

	return me;
}();;
var ProTracker = function(){
	var me = {};

	me.load = function(file,_a){

		Tracker._R(TRACKERMODE.PROTRACKER,true);
        Tracker._s = false;
        Tracker.$a(31);

		var song = {
			patterns:[],
			_L: 1
		};

		var patternLength = 64;
		var _uCount = 31;
		var channelCount = 4;


		//see https://www.aes.id.au/modformat.html

		song.typeId = file._v(4,1080);
		song.title = file._v(20,0);

		if (song.typeId === "2CHN") channelCount = 2;
		if (song.typeId === "6CHN") channelCount = 6;
		if (song.typeId === "8CHN") channelCount = 8;
		if (song.typeId === "10CH") channelCount = 10;
		if (song.typeId === "12CH") channelCount = 12;
		if (song.typeId === "14CH") channelCount = 14;
		if (song.typeId === "16CH") channelCount = 16;
		if (song.typeId === "18CH") channelCount = 18;
		if (song.typeId === "20CH") channelCount = 20;
		if (song.typeId === "22CH") channelCount = 22;
		if (song.typeId === "24CH") channelCount = 24;
		if (song.typeId === "26CH") channelCount = 26;
		if (song.typeId === "28CH") channelCount = 28;
		if (song.typeId === "30CH") channelCount = 30;
		if (song.typeId === "32CH") channelCount = 32;

		song.channels = channelCount;

		var sampleDataOffset = 0;
		for (i = 1; i <= _uCount; ++i) {
			var _uName = file._v(22);
			var sampleLength = file._g(); // in words

			var _u = Instrument();
			_u._a = _uName;

			_u.sample.length = _u.sample.realLen = sampleLength << 1;
			var finetune = file._e();
			if (finetune>16) finetune = finetune%16;
			if (finetune>7) finetune -= 16;
			_u.setFineTune(finetune);
			_u.sample.volume   = file._e();
			_u.sample.loop.start    = file._g() << 1;
			_u.sample.loop.length   = file._g() << 1;

			_u.sample.loop.enabled = _u.sample.loop.length>2;
			_u.sample.loop.type = LOOPTYPE.FORWARD;

			_u.pointer = sampleDataOffset;
			sampleDataOffset += _u.sample.length;
			_u.setSampleIndex(0);
			Tracker.setInstrument(i,_u);

			
		}
		song._us = Tracker.getInstruments();


		file.goto(950);
		song.length = file._e();
		file.jump(1); // 127 byte

		var patternTable = [];
		var highestPattern = 0;
		for (var i = 0; i < 128; ++i) {
			patternTable[i] = file._e();
			if (patternTable[i] > highestPattern) highestPattern = patternTable[i];
		}
		song.patternTable = patternTable;

		file.goto(1084);

		// pattern data

		for (i = 0; i <= highestPattern; ++i) {

			var patternData = [];

			for (var step = 0; step<patternLength; step++){
				var row = [];
				var channel;
				for (channel = 0; channel < channelCount; channel++){
					var note = Note();
					var trackStepInfo = file.readUint();

					note.setPeriod((trackStepInfo >> 16) & 0x0fff);
					note.effect = (trackStepInfo >>  8) & 0x0f;
					note._u = (trackStepInfo >> 24) & 0xf0 | (trackStepInfo >> 12) & 0x0f;
					note._i  = trackStepInfo & 0xff;

					row.push(note);
				}

				// fill with empty data for other channels
				// TODO: not needed anymore ?
				for (channel = channelCount; channel < Tracker.$b(); channel++){
					row.push(Note())
				}


				patternData.push(row);
			}
			song.patterns.push(patternData);

			//file.jump(1024);
		}

		var _uContainer = [];

		for(i=1; i <= _uCount; i++) {
			_u = Tracker.getInstrument(i);
			if (_u){
				console.log(
					"Reading sample from 0x" + file.index + " with length of " + _u.sample.length + " bytes and repeat length of " + _u.sample.loop.length);


				var sampleEnd = _u.sample.length;

				if (_u.sample.loop.length>2 && SETTINGS.unrollShortLoops && _u.sample.loop.length<1000){
					// cut off trailing bytes for short looping samples
					sampleEnd = Math.min(sampleEnd,_u.sample.loop.start + _u.sample.loop.length);
					_u.sample.length = sampleEnd;
				}

				for (j = 0; j<sampleEnd; j++){
					var b = file.readByte();
					// ignore first 2 bytes
					if (j<2)b=0;
					_u.sample.data.push(b / 127)
				}

				// unroll short loops?
				// web audio loop start/end is in seconds
				// doesn't work that well with tiny loops

				if ((SETTINGS.unrollShortLoops || SETTINGS.unrollLoops) && _u.sample.loop.length>2){

					var loopCount = Math.ceil(40000 / _u.sample.loop.length) + 1;

					if (!SETTINGS.unrollLoops) loopCount = 0;

					var resetLoopNumbers = false;
					var loopLength = 0;
					if (SETTINGS.unrollShortLoops && _u.sample.loop.length<1600){

						loopCount = Math.floor(1000/_u.sample.loop.length);
						resetLoopNumbers = true;
					}

					for (var l=0;l<loopCount;l++){
						var start = _u.sample.loop.start;
						var end = start + _u.sample.loop.length;
						for (j=start; j<end; j++){
							_u.sample.data.push(_u.sample.data[j]);
						}
						loopLength += _u.sample.loop.length;
					}

					if (resetLoopNumbers && loopLength){
						_u.sample.loop.length += loopLength;
						_u.sample.length += loopLength;
					}
				}

				_uContainer.push({label: i + " " + _u._a, data: i});
			}
		}
        EventBus._o(EVENT._uListChange,_uContainer);

		return song;
	};



	return me;
};;
var SoundTracker = function(){
	var me = {};

	me.load = function(file,_a){

		Tracker._R(TRACKERMODE.PROTRACKER,true);
        Tracker._s = false;
		Tracker.$a(15);

		var song = {
			patterns:[],
			_L: 1
		};

		var patternLength = 64;
		var _uCount = 15;


		//see https://www.aes.id.au/modformat.html
		// and ftp://ftp.modland.com/pub/documents/format_documentation/Ultimate%20Soundtracker%20(.mod).txt for differences

		song.typeId = "ST";
		song.channels = 4;
		song.title = file._v(20,0);

		var sampleDataOffset = 0;
		for (i = 1; i <= _uCount; ++i) {
			var sampleName = file._v(22);
			var sampleLength = file._g(); // in words

			var _u = Instrument();
			_u._a = sampleName;

			_u.sample.length = _u.realLen = sampleLength << 1;
			_u.sample.volume   = file._g();
			// NOTE: does the high byte of the volume sometimes contain finetune data?
			_u.setFineTune(0);
			_u.sample.loop.start     = file._g(); // in bytes!
			_u.sample.loop.length   = file._g() << 1;

			_u.sample.loop.enabled = _u.sample.loop.length>2;
			_u.sample.loop.type = LOOPTYPE.FORWARD;

			// if an _u contains a loops, only the loop part is played
			// TODO

			_u.pointer = sampleDataOffset;
			sampleDataOffset += _u.sample.length;
			_u.setSampleIndex(0);
			Tracker.setInstrument(i,_u);

		}
		song._us = Tracker.getInstruments();

		file.goto(470);

		song.length = file._e();
		song.speed = file._e();

		var patternTable = [];
		var highestPattern = 0;
		for (var i = 0; i < 128; ++i) {
			patternTable[i] = file._e();
			if (patternTable[i] > highestPattern) highestPattern = patternTable[i];
		}
		song.patternTable = patternTable;

		file.goto(600);

		// pattern data

		for (i = 0; i <= highestPattern; ++i) {

			var patternData = [];

			for (var step = 0; step<patternLength; step++){
				var row = [];
				var channel;
				for (channel = 0; channel < 4; channel++){
					var trackStep = {};
					var trackStepInfo = file.readUint();

					trackStep._b = (trackStepInfo >> 16) & 0x0fff;
					trackStep.effect = (trackStepInfo >>  8) & 0x0f;
					trackStep._u = (trackStepInfo >> 24) & 0xf0 | (trackStepInfo >> 12) & 0x0f;
					trackStep._i  = trackStepInfo & 0xff;

					row.push(trackStep);
				}

				// fill with empty data for other channels
				for (channel = 4; channel < Tracker.$b(); channel++){
					row.push({note:0,effect:0,_u:0,_i:0});
				}

				patternData.push(row);
			}
			song.patterns.push(patternData);

			//file.jump(1024);
		}

		var _uContainer = [];

		for(i=1; i <= _uCount; i++) {
			_u = Tracker.getInstrument(i);
			if (_u){
				console.log("Reading sample from 0x" + file.index + " with length of " + _u.sample.length + " bytes and repeat length of " + _u.sample.loop.length);

				var sampleEnd = _u.sample.length;

				for (j = 0; j<sampleEnd; j++){
					var b = file.readByte();
					// ignore first 2 bytes
					if (j<2)b=0;
					_u.sample.data.push(b / 127)
				}

				_uContainer.push({label: i + " " + _u._a, data: i});
			}
		}
        EventBus._o(EVENT._uListChange,_uContainer);

		return song;
	};

	return me;
};;
var FastTracker = function(){
    var me = {};

    // see ftp://ftp.modland.com/pub/documents/format_documentation/FastTracker%202%20v2.04%20(.xm).html
    me.load = function(file,_a){

        console.log("loading FastTracker");
        Tracker._R(TRACKERMODE.FASTTRACKER,true);
		Tracker.$a(1);

        var mod = {};
        var song = {
            patterns:[],
			_us:[]
        };

        file._N = true;

        file.goto(17);
        song.title = file._v(20);
        file.jump(1); //$1a

        mod.trackerName = file._v(20);
        mod.trackerVersion = file.readByte();
        mod.trackerVersion = file.readByte() + "." + mod.trackerVersion;
        mod.headerSize = file.$c(); // is this always 276?
        mod.songlength = file._g();
        mod._L = file._g();
        mod.numberOfChannels = file._g();
        mod.numberOfPatterns = file._g(); // this is sometimes more then the actual number? should we scan for highest pattern? -> YES! -> NO!
        mod.numberOfInstruments = file._g();
        mod.flags = file._g();
        if (mod.flags%2 === 1){
            Tracker._s = true;
        }else{
            Tracker._s = false;
        }

        mod.defaultTempo = file._g();
        mod.defaultBPM = file._g();

        console.log("File was made in " + mod.trackerName + " version " + mod.trackerVersion);


        var patternTable = [];
        var highestPattern = 0;
        for (var i = 0; i < mod.songlength; ++i) {
            patternTable[i] = file._e();
            if (highestPattern < patternTable[i]) highestPattern = patternTable[i];
        }
        song.patternTable = patternTable;
        song.length = mod.songlength;
        song.channels = mod.numberOfChannels;
        song._L = (mod._L + 1);

        var fileStartPos = 60 + mod.headerSize;
        file.goto(fileStartPos);


        for (i = 0; i < mod.numberOfPatterns; i++) {

            var patternData = [];
            var thisPattern = {};

            thisPattern.headerSize = file.$c();
            thisPattern.packingType = file._e(); // always 0
            thisPattern.patternLength = file._g();
            thisPattern.patternSize = file._g();

            fileStartPos += thisPattern.headerSize;
            file.goto(fileStartPos);

            for (var step = 0; step<thisPattern.patternLength; step++){
                var row = [];
                var channel;
                for (channel = 0; channel < mod.numberOfChannels; channel++){
                    var note = Note();
                    var v = file._e();

                    if (v & 128) {
                        if (v &  1) note.setIndex(file._e());
                        if (v &  2) note._u = file._e();
                        if (v &  4) note._T = file._e();
                        if (v &  8) note.effect = file._e();
                        if (v & 16) note._i  = file._e();
                    } else {
                        note.setIndex(v);
                        note._u = file._e();
                        note._T = file._e();
                        note.effect = file._e();
                        note._i  = file._e();
                    }

                    row.push(note);


                }
                patternData.push(row);
            }

            fileStartPos += thisPattern.patternSize;
            file.goto(fileStartPos);

            song.patterns.push(patternData);
        }

        var _uContainer = [];

        for (i = 1; i <= mod.numberOfInstruments; ++i) {


			var _u = Instrument();

			try{
				_u.filePosition = file.index;
				_u.headerSize = file.$c();

				_u._a = file._v(22);
				_u.type = file._e();
				_u._K = file._g();
				_u.samples = [];
				_u._M = 0;

				if (_u._K>0){
					_u._M = file.$c();

					// some files report incorrect sampleheadersize (18, without the sample_a)
					// e.g. dubmood - cybernostra weekends.xm
					// sample header should be at least 40 bytes
					_u._M = Math.max(_u._M,40);

					// and not too much ... (Files saved with sk@letracker)
					if (_u._M>200) _u._M=40;

					//should we assume it's always 40? not according to specs ...


					for (var si = 0; si<96;  si++) _u._z.push(file._e());
					for (si = 0; si<24;  si++) _u._c.raw.push(file._g());
					for (si = 0; si<24;  si++) _u._d.raw.push(file._g());

					_u._c.count = file._e();
					_u._d.count = file._e();
					_u._c._H = file._e();
					_u._c._w = file._e();
					_u._c._J = file._e();
					_u._d._H = file._e();
					_u._d._w = file._e();
					_u._d._J = file._e();
					_u._c.type = file._e();
					_u._d.type = file._e();
					_u._p.type = file._e();
					_u._p.sweep = file._e();
					_u._p.depth = Math.min(file._e(),15); // some trackers have a different scale here? (e.g. Ambrozia)
					_u._p.rate = file._e();
					_u.fadeout = file._g();
					_u.reserved = file._g();

					function processEnvelope(envelope){
						envelope.points = [];
						for (si = 0; si < 12; si++) envelope.points.push(envelope.raw.slice(si*2,si*2+2));
						if (envelope.type & 1){ // on
							envelope.enabled = true;
						}

						if (envelope.type & 2){
							// sustain
							envelope.sustain = true;
						}

						if (envelope.type & 4){
							// loop
							envelope.loop = true;
						}

						return envelope;

					}

					_u._c = processEnvelope(_u._c);
					_u._d = processEnvelope(_u._d);

				}
			}catch (e) {
				console.error("error",e);
			}

            fileStartPos += _u.headerSize;
            file.goto(fileStartPos);


            if (_u._K === 0){
                var sample = Sample();
                _u.samples.push(sample);
            }else{
                if (file.isEOF(1)){
                    console.error("seek past EOF");
                    console.error(_u);
                    break;
                }

                for (var sampleI = 0; sampleI < _u._K; sampleI++){
                    sample = Sample();

                    sample.length = file.$c();
                    sample.loop.start = file.$c();
                    sample.loop.length = file.$c();
                    sample.volume = file._e();
                    sample.finetuneX = file.readByte();
                    sample.type = file._e();
                    sample.panning = file._e() - 128;
                    sample.relativeNote = file.readByte();
                    sample.reserved = file.readByte();
                    sample._a = file._v(22);
                    sample.bits = 8;

                    _u.samples.push(sample);
                    fileStartPos += _u._M;

                    file.goto(fileStartPos);
                }

                for (sampleI = 0; sampleI < _u._K; sampleI++){
                    sample = _u.samples[sampleI];
                    if (!sample.length) continue;

                    fileStartPos += sample.length;

                    if (sample.type & 16) {
                        sample.bits       = 16;
                        sample.type      ^= 16;
                        sample.length    >>= 1;
                        sample.loop.start >>= 1;
                        sample.loop.length   >>= 1;
                    }
                    sample.loop.type = sample.type || 0;
                    sample.loop.enabled = !!sample.loop.type;

                    // sample data
                    console.log("Reading sample from 0x" + file.index + " with length of " + sample.length + (sample.bits === 16 ? " words" : " bytes") +  " and repeat length of " + sample.loop.length);
                    var sampleEnd = sample.length;


                    var old = 0;
                    if (sample.bits === 16){
                        for (var j = 0; j<sampleEnd; j++){
                            var b = file.readShort() + old;
                            if (b < -32768) b += 65536;
                            else if (b > 32767) b -= 65536;
                            old = b;
                            sample.data.push(b / 32768);
                        }
                    }else{
                        for (j = 0; j<sampleEnd; j++){
                            b = file.readByte() + old;

                            if (b < -128) b += 256;
                            else if (b > 127) b -= 256;
                            old = b;
                            sample.data.push(b / 127); // TODO: or /128 ? seems to introduce artifacts - see test-loop-fadeout.xm
                        }
                    }

                    // unroll ping pong loops
                    if (sample.loop.type === LOOPTYPE.PINGPONG){

                        // TODO: keep original sample?
                        var loopPart = sample.data.slice(sample.loop.start,sample.loop.start + sample.loop.length);

                        sample.data = sample.data.slice(0,sample.loop.start + sample.loop.length);
                        sample.data = sample.data.concat(loopPart.reverse());
                        sample.loop.length = sample.loop.length*2;
                        sample.length = sample.loop.start + sample.loop.length;

                    }

                    file.goto(fileStartPos);

                }
            }

            _u.setSampleIndex(0);

            Tracker.setInstrument(i,_u);
            _uContainer.push({label: i + " " + _u._a, data: i});

        }
        EventBus._o(EVENT._uListChange,_uContainer);
        song._us = Tracker.getInstruments();

        Tracker.setBPM(mod.defaultBPM);
        Tracker._x(mod.defaultTempo);

        me.validate(song);

        return song;
    };


    // build internal


    me.validate = function(song){
    	
		function checkEnvelope(envelope,type){
			var isValid = true;
			if (envelope.points && envelope.points[0]){
				if (envelope.points[0][0] === 0){
					var c = 0;
					for (var i=1;i<envelope.count;i++){
						var point = envelope.points[i];
						if (point && point[0]>c){
							c = point[0];
						}else{
							isValid=false;
						}
					}
				}else{
					isValid = false;
				}
			}else{
				isValid = false;
			}
			
			if (isValid){
				return envelope;
			}else{
				console.warn("Invalid envelope, resetting to default");
				return type === "volume" 
					? {raw: [], enabled: false, points: [[0,48],[10,64],[20,40],[30,18],[40,28],[50,18]], count:6}
					: {raw: [], enabled: false, points: [[0,32],[20,40],[40,24],[60,32],[80,32]], count:5};
			}
		}

    	song._us.forEach(function(_u){
    		// check envelope
			_u._c = checkEnvelope(_u._c,"volume");
			_u._d = checkEnvelope(_u._d,"panning");
			
			// check sampleIndexes;
			var maxSampleIndex = _u.samples.length-1;
			for (var i = 0, max = _u._z.length; i<max; i++){
				_u._z[i] = Math.min(_u._z[i],maxSampleIndex);
			}
		})

	};

    return me;
};

;
var Instrument = function(){
	var me = {};

	me.type = "sample";
	me._a = "";
	me._q = 0;
	me.sampleIndex = -1;
	me.fadeout = 128;
	me.data = [];
	me.samples = [Sample()];
	me.sample = me.samples[0];

	me._c = {raw: [], enabled: false, points: [[0,48],[10,64],[20,40],[30,18],[40,28],[50,18]], count:6};
	me._d = {raw: [], enabled: false, points: [[0,32],[20,40],[40,24],[60,32],[80,32]], count:5};
	me._p = {};

	me._z = [];

	me.play = function(noteIndex,notePeriod,volume,track,trackEffects,time){
		if (Tracker._j()) {
			notePeriod = me._O(noteIndex);
		}
		return Audio.playSample(me._q,notePeriod,volume,track,trackEffects,time,noteIndex);
	};

	me.noteOn = function(time){
		var _c;
		var _d;
		var scheduled = {};

		if (me._c.enabled){
			_c = Audio.context.createGain();
			var envelope = me._c;
			var scheduledTime = processEnvelop(envelope,_c,time);
			if (scheduledTime) scheduled.volume = (time + scheduledTime);
		}

		if (me._d.enabled && Audio.usePanning){
			_d = Audio.context.createStereoPanner();
			envelope = me._d;
			scheduledTime = processEnvelop(envelope,_d,time);
			if (scheduledTime) scheduled.panning = (time + scheduledTime);
		}

		if (me._p.rate && me._p.depth){
			scheduled.ticks = 0;
			scheduled._p = time;
			scheduled._pFunction = me._D();
		}

		return {volume: _c, panning: _d, scheduled: scheduled};
	};

	me.noteOff = function(time,noteInfo){
		if (!noteInfo || !noteInfo.volume) return;

		function cancelScheduledValues(){
			// Note: we should cancel Volume and Panning scheduling independently ...
			noteInfo.volume.gain.cancelScheduledValues(time);
			noteInfo._X.gain.cancelScheduledValues(time);

			if (noteInfo._c) noteInfo._c.gain.cancelScheduledValues(time);
			if (noteInfo._d) noteInfo._d.pan.cancelScheduledValues(time);
			noteInfo.scheduled = undefined;
		}


		if (Tracker._j()){
			var tickTime = Tracker.getProperties().tickTime;

			if (me._c.enabled){

				if (me._c.sustain && noteInfo._c){
					cancelScheduledValues();
					var timeOffset = 0;
					var startPoint = me._c.points[me._c._H];
					if (startPoint) timeOffset = startPoint[0]*tickTime;
					for (var p = me._c._H; p< me._c.count;p++){
						var point = me._c.points[p];
						if (point) noteInfo._c.gain.linearRampToValueAtTime(point[1]/64,time + (point[0]*tickTime) - timeOffset);
					}
				}

				if (me.fadeout){
					var fadeOutTime = (65536/me.fadeout) * tickTime / 2;
					noteInfo._X.gain.linearRampToValueAtTime(0,time + fadeOutTime);
				}

			}else{
				cancelScheduledValues();
				noteInfo._X.gain.linearRampToValueAtTime(0,time + 0.1)
			}

            if (me._d.enabled && Audio.usePanning && noteInfo._d){
                timeOffset = 0;
                startPoint = me._d.points[me._d._H];
                if (startPoint) timeOffset = startPoint[0]*tickTime;
                for (p = me._d._H; p< me._d.count;p++){
                    point = me._d.points[p];
                    if (point) noteInfo._d.pan.linearRampToValueAtTime((point[1]-32)/32,time + (point[0]*tickTime) - timeOffset);
                }
            }

			return 100;

		}else{
			cancelScheduledValues();
			if (noteInfo.isKey && noteInfo.volume){
				noteInfo.volume.gain.linearRampToValueAtTime(0,time + 0.5)
			}else{
				return 0;
			}
		}

	};

	function processEnvelop(envelope,audioNode,time){
		var tickTime = Tracker.getProperties().tickTime;
		var maxPoint = envelope.sustain ? envelope._H+1 : envelope.count;

		// some XM files seem to have loop points outside the range.
		// e.g. springmellow_p_ii.xm - _u 15;
		envelope._w = Math.min(envelope._w,envelope.count-1);
		envelope._J = Math.min(envelope._J,envelope.count-1);

		var doLoop = envelope.loop && (envelope._w<envelope._J);
		if (envelope.sustain && envelope._H<=envelope._w) doLoop=false;


		if (doLoop) maxPoint = envelope._J+1;
		var scheduledTime = 0;
		var lastX = 0;

		if (audioNode.gain){
			// volume
			var audioParam = audioNode.gain;
			var center = 0;
			var max = 64;
		}else{
			// panning node
			audioParam = audioNode.pan;
			center = 32;
			max = 32;
		}

		audioParam.setValueAtTime((envelope.points[0][1]-center)/max,time);

		for (var p = 1; p<maxPoint;p++){
			var point = envelope.points[p];
			lastX = point[0];
			scheduledTime = lastX*tickTime;
			audioParam.linearRampToValueAtTime((point[1]-center)/max,time + scheduledTime);
		}

		if (doLoop){
			return me.scheduleEnvelopeLoop(audioNode,time,2,scheduledTime);
		}

		return false;
	}

	me.scheduleEnvelopeLoop = function(audioNode,startTime,seconds,scheduledTime){

		// note - this is not 100% accurate when the ticktime would change during the scheduled ahead time

		scheduledTime = scheduledTime || 0;
		var tickTime = Tracker.getProperties().tickTime;

		if (audioNode.gain){
			// volume
			var envelope = me._c;
			var audioParam = audioNode.gain;
			var center = 0;
			var max = 64;
		}else{
			// panning node
			envelope = me._d;
			audioParam = audioNode.pan;
			center = 32;
			max = 32;
		}
		var point = envelope.points[envelope._w];
		var loopStartX = point[0];

		var doLoop = envelope.loop && (envelope._w<envelope._J);
		if (doLoop){
			while (scheduledTime < seconds){
				var startScheduledTime = scheduledTime;
				for (var p = envelope._w; p<=envelope._J;p++){
					point = envelope.points[p];
					scheduledTime = startScheduledTime + ((point[0]-loopStartX)*tickTime);
					audioParam.linearRampToValueAtTime((point[1]-center)/max,startTime + scheduledTime);
				}
			}
		}

		return scheduledTime;

	};


	me.scheduleAutoVibrato = function(note,seconds){
		// this is only used for keyboard notes as in the player the main playback timer is used for this
		var scheduledTime = 0;
		note.scheduled.ticks = note.scheduled.ticks || 0;
		var tickTime = Tracker.getProperties().tickTime;

		var freq = -me._p.rate/40;
		var amp = me._p.depth/8;
		if (Tracker._s) amp *= 4;

		var currentPeriod,_pFunction,time,tick;
		if (note.source) {
			currentPeriod = note._U;
			_pFunction = note.scheduled._pFunction || Audio._r.sine;
			time = note.scheduled._p || Audio.context.currentTime;
			tick = 0;
		}


		while (scheduledTime < seconds){
			scheduledTime += tickTime;

			if (currentPeriod){
                var sweepAmp = 1;
                if (me._p.sweep && note.scheduled.ticks<me._p.sweep){
                    sweepAmp = 1-((me._p.sweep-note.scheduled.ticks)/me._p.sweep);
                }

				var targetPeriod = _pFunction(currentPeriod,note.scheduled.ticks,freq,amp*sweepAmp);
				Tracker.$d(note,targetPeriod,time + (tick*tickTime));
				tick++;
			}
			note.scheduled.ticks++;
		}

		return scheduledTime;
	};

	me._D = function(){
        switch(me._p.type){
            case 1: return Audio._r.square;
            case 2: return Audio._r.saw;
            case 3: return Audio._r.sawInverse;
        }
        return Audio._r.sine;
	};

	me.resetVolume = function(time,noteInfo){
        if (noteInfo._X) {
            noteInfo._X.gain.cancelScheduledValues(time);
            noteInfo._X.gain.setValueAtTime(1, time);
        }

        if (noteInfo._c){
            noteInfo._c.gain.cancelScheduledValues(time);
            var tickTime = Tracker.getProperties().tickTime;

            var maxPoint = me._c.sustain ? me._c._H+1 :  me._c.count;
            noteInfo._c.gain.setValueAtTime(me._c.points[0][1]/64,time);
            for (var p = 1; p<maxPoint;p++){
                var point = me._c.points[p];
                noteInfo._c.gain.linearRampToValueAtTime(point[1]/64,time + (point[0]*tickTime));
            }
		}
	};

	me._G = function(){
		return Tracker._j() ? me.sample.finetuneX : me.sample.finetune;
	};

	me.setFineTune = function(finetune){
		if (Tracker._j()){
			me.sample.finetuneX = finetune;
			me.sample.finetune = finetune >> 4;
		}else{
            if (finetune>7) finetune = finetune-16;
			me.sample.finetune = finetune;
			me.sample.finetuneX = finetune << 4;
		}
	};

	// in FT mode
	me._O = function(noteIndex,withFineTune){
		var result = 0;

		if (Tracker._s){
			result =  7680 - (noteIndex-1)*64;
			if (withFineTune) result -= me._G()/2;
		}else{
			result = FTNotes[noteIndex]._b;
			if (withFineTune && me._G()){
				result = Audio._E(noteIndex,me._G());
			}
		}

		return result;
	};

	me.setSampleForNoteIndex = function(noteIndex){
		var sampleIndex = me._z[noteIndex-1];
		if (sampleIndex !== me.sampleIndex && typeof sampleIndex === "number"){
			me.setSampleIndex(sampleIndex);
		}
	};

	me.setSampleIndex = function(index){
		if (me.sampleIndex !== index){
			me.sample = me.samples[index];
			me.sampleIndex = index;

			EventBus._o(EVENT.sampleIndexChange,me._q);
		}
	};

	me.hasSamples = function(){
		for (var i = 0, max = me.samples.length; i<max; i++){
			if (me.samples[i].length) return true;
		}
	};

	me.hasVibrato = function(){
		return me._p.rate && me._p.depth;
	};


	return me;
};;
var Sample = function(){
	var me = {};

	me.data = [];
	me.length = 0;
	me._a = "";
	me.bits = 8;

	me.volume = 64;
	me.finetune = 0;
	me.finetuneX = 0;
	me.panning = 0;
	me.relativeNote = 0;

    me.loop = {
        enabled: false,
        start: 0,
        length: 0,
        type: 0
    };

	me.check = function(){
		var min = 0;
		var max = 0;
		for (var i = 0, len = me.data.length; i<len; i++){
			min = Math.min(min,me.data[i]);
			max = Math.max(max,me.data[i]);
		}
		return {min: min, max: max};
	};


	return me;
};;
var Note = function(){
	var me = {};

	me._b = 0;
	me.index = 0;
	me.effect = 0;
	me._u = 0;
	me._i = 0;
	me._T = 0;


	me.setPeriod = function(_b){
		me._b = _b;
		me.index = FTPeriods[_b] || 0;
	};

	me.setIndex = function(index){
		me.index = index;
		var ftNote = FTNotes[index];
		if (ftNote){
			me._b = ftNote._k || ftNote._b;
			if (me._b === 1) me._b = 0;
		}else{
			console.warn("No note for index " + index);
			me._b = 0;
		}
	};

	me.clear = function(){
		me._u = 0;
		me._b = 0;
		me.effect = 0;
		me._i = 0;
		me.index = 0;
		me._T = 0;
	};

	me.duplicate = function(){
		return {
			_u: me._u,
			_b : me._b,
			effect: me.effect,
			_i: me._i,
			_T: me._T,
			note: me.index
		}
	};

	me.populate = function(data){
			me._u = data._u || 0;
			me._b = data._b|| 0;
			me.effect = data.effect || 0;
			me._i = data._i || 0;
			me._T =  data._T || 0;
			me.index =  data.note || data.index || 0;
	};


	return me;
};;
return {
        init: Tracker.init,
        load: Tracker.load,
        playSong: Tracker.playSong,
        stop: Tracker.stop,
        togglePlay: Tracker.togglePlay,
        isPlaying: Tracker.isPlaying,
        $b: Tracker.$b,
        getSong: Tracker.getSong,
        getInstruments: Tracker.getInstruments,
        getStateAtTime: Tracker.getStateAtTime,
        getTimeStates: Tracker.getTimeStates,
        setCurrentSongPosition: Tracker.setCurrentSongPosition,
        setBPM: Tracker.setBPM,
        getBPM: Tracker.getBPM,
        _x: Tracker._x,
        getAmigaSpeed: Tracker.getAmigaSpeed,
        setMaster: Tracker.setMaster,
        isMaster: Tracker.isMaster,
        audio: Audio
    };
});


if (typeof HostBridge === "undefined" || !HostBridge.customConfig){
    BassoonTracker = BassoonTracker();
}



