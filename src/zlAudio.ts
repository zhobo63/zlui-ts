

class zlAudioSource
{
    constructor(ctx:AudioContext) {
        this.audio_ctx=ctx;
    }

    async load(url:string):Promise<boolean> {
        const arrayBuffer:ArrayBuffer = await fetch(url).then(response=>{
            return response.arrayBuffer();
        });
        if(!arrayBuffer)
            return false;
        const audioBuffer = await this.audio_ctx.decodeAudioData(arrayBuffer);
        const source = this.audio_ctx.createBufferSource();
        const gain=this.audio_ctx.createGain();
        source.buffer = audioBuffer;
        source.connect(gain);        
        gain.connect(this.audio_ctx.destination);
        this.source=source;
        this.gain=gain;
        return true;
    }

    play():boolean {
        if(!this.source)
            return false;
        this.source.start(0);
        return true;
    }
    stop() {
        if(this.source) {
            this.source.stop();
        }
    }

    audio_ctx:AudioContext;
    source:AudioBufferSourceNode;
    gain:GainNode;
    is_music:boolean;
    volumn:number=1.0;
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
            source.gain.gain.value=(is_music?this.volumnMusic:this.volumnSound)*source.volumn;
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
        source.gain.gain.value=(source.is_music?this.volumnMusic:this.volumnSound)*volumn;
    }
    setVolumnMusic(volumn:number) {
        this.volumnMusic=volumn;
        for(let name in this.sources) {
            let source=this.sources[name];
            if(source.is_music) {
                source.gain.gain.value=(source.is_music?this.volumnMusic:this.volumnSound)*source.volumn;
            }
        }
    }
    setVolumnSound(volumn:number) {
        this.volumnSound=volumn;
        for(let name in this.sources) {
            let source=this.sources[name];
            if(!source.is_music) {
                source.gain.gain.value=(source.is_music?this.volumnMusic:this.volumnSound)*source.volumn;
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
    

    audio_ctx:AudioContext
    volumnMusic:number = 1.0;  //volumn range: 0 ~ 1.0
    volumnSound:number = 1.0;
    mute:boolean = false;
    pause:boolean = false;

    sources:{[key:string]:zlAudioSource}={}
}

export const gAudio=new zlAudio;
