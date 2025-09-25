

class zlAudioSource
{
    constructor(ctx:AudioContext) {
        this.audio_ctx=ctx;
    }

    gainValue():number {
        return (this.is_music?gAudio.volumnMusic:gAudio.volumnSound)*this.volumn;
    }
    updateGain() {
        this.gain.gain.value=this.gainValue();
    }

    async load(url:string):Promise<boolean> {
        const arrayBuffer:ArrayBuffer = await fetch(url).then(response=>{
            return response.arrayBuffer();
        });
        if(!arrayBuffer)
            return false;
        const audioBuffer = await this.audio_ctx.decodeAudioData(arrayBuffer);
        const gain=this.audio_ctx.createGain();
        this.audio_buffer=audioBuffer;
        this.gain=gain;        
        return true;
    }

    play():boolean {
        if(!this.source) {
            let source=this.audio_ctx.createBufferSource();
            source.buffer=this.audio_buffer;
            source.connect(this.gain);
            this.gain.connect(this.audio_ctx.destination);
            this.source=source;
            this.gain.gain.value=this.gainValue();
            this.source.onended=()=>{this.source=null;}
            this.source.loop=this.is_music;
            this.source.start(0);
        }        
        return true;
    }
    stop() {
        if(this.source) {
            this.source.stop();
            this.source=null;
        }
    }

    audio_ctx:AudioContext;
    audio_buffer:AudioBuffer;
    source:AudioBufferSourceNode;
    gain:GainNode;
    is_music:boolean;
    volumn:number=1.0;
}

interface IFading
{
    name:string
    curtime?:number
    duration:number
    volumn_start:number
    volumn_end:number
    callback?:(name:string)=>void
}

class zlAudio
{
    constructor()
    {
        this.audio_ctx=new AudioContext();
    }    
    createContext() {
        if(!this.audio_ctx) {
            this.audio_ctx=new AudioContext();
        }
    }

    destroy() {
        this.stopAll();
        this.sources={};
        if(typeof this.audio_ctx.close !== 'undefined') {
            this.audio_ctx.close();
        }
        this.audio_ctx=null;
    }

    async load(name:string, url:string, is_music:boolean):Promise<zlAudioSource> {
        let source=new zlAudioSource(this.audio_ctx);
        let ret=await source.load(url);
        if(ret) {
            source.is_music=is_music;
            this.sources[name]=source;
            return source;
        }
        return null;
    }

    async loadMusic(name:string, url:string):Promise<zlAudioSource> {
        return await this.load(name, url, true);
    }
    async loadSound(name:string, url:string):Promise<zlAudioSource> {
        return await this.load(name, url, false);
    }

    setVolumn(name:string, volumn:number) {
        let source=this.sources[name];
        source.volumn=volumn;
        source.updateGain();
    }
    setVolumnMusic(volumn:number) {
        this.volumnMusic=volumn;
        for(let name in this.sources) {
            let source=this.sources[name];
            if(source.is_music) {
                source.updateGain();
            }
        }
    }
    setVolumnSound(volumn:number) {
        this.volumnSound=volumn;
        for(let name in this.sources) {
            let source=this.sources[name];
            if(!source.is_music) {
                source.updateGain();
            }
        }
    }

    stopAll() {
        for(let name in this.sources) {
            let source=this.sources[name];
            source.stop();
        }
    }

    stopAllMusic() {
        for(let name in this.sources) {
            let source=this.sources[name];
            if(source.is_music) {
                source.stop();
            }
        }
    }
    stopAllSound() {
        for(let name in this.sources) {
            let source=this.sources[name];
            if(!source.is_music) {
                source.stop();
            }
        }
    }

    play(name:string):boolean {
        let source=this.sources[name];
        return (source) ? source.play() : false;
    }
    stop(name:string) {
        let source=this.sources[name];
        if (source) source.stop();
    }

    update(ti:number) {
        let has_done=false;
        for(let fade of this.fadings) {
            let source=this.sources[fade.name];
            if(!source) {
                fade.curtime=fade.duration;
                has_done=true;
                continue;
            }
            fade.curtime+=ti;
            let volumn=Math.min(fade.curtime/fade.duration, 1)*(fade.volumn_end-fade.volumn_start) + fade.volumn_start;
            source.volumn=volumn;
            source.updateGain();
            if(fade.curtime>=fade.duration) {
                has_done=true;
                if(fade.callback) fade.callback(fade.name);
            }
        }
        if(has_done) {
            this.fadings=this.fadings.filter(v=>v.curtime<v.duration);
        }
    }

    fading(fade:IFading) {
        fade.curtime=0;
        this.fadings.push(fade);
    }
    

    audio_ctx:AudioContext
    volumnMusic:number = 1.0;  //volumn range: 0 ~ 1.0
    volumnSound:number = 1.0;
    mute:boolean = false;
    pause:boolean = false;

    sources:{[key:string]:zlAudioSource}={};
    fadings:IFading[]=[];
}

export const gAudio=new zlAudio;
