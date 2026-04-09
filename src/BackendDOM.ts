import { Align, BoardType, EAnchor, EDragLimit, ESliderType, IBackend, IFont, IPaint, ITexture, IVec2, Rect, RESIZEBAR_SIZE, TexturePack, zlUIButton, zlUICheck, zlUICombo, zlUIDatePicker, zlUIEdit, zlUIImage, zlUIImageText, zlUILabelEdit, zlUIMgr, zlUIPanel, zlUISlider, zlUITree, zlUITreeNode, zlUIWin } from "./zlUI";

function CSSrgba(c:number, alpha:number):string
{
    const r=c&0xff;
    const g=(c>>8)&0xff;
    const b=(c>>16)&0xff;
    const a=((c>>>24)&0xff)/255.0*alpha;
    return `rgba(${r},${g},${b},${a.toPrecision(4)})`;
}

class TextureDOM implements ITexture
{
    Destroy() {

    }

    _texture!:WebGLTexture;
    _width!:number;
    _height!:number;
    _wrapS!:number;
    _wrapT!:number;
    _minFilter!:number;
    _magFilter!:number;    
}

class FontDOM implements IFont
{
    constructor()
    {

    }

    AddFontRange(start:number, end:number) {}
    MergeFont(font:IFont) {}
    CalTextSize(size: number, max_width: number, wrap_width: number, text_begin: string,
            text_end?: number,
            isready?:boolean[]) :IVec2
    {
        let id='FontDOM_CalTextSize';
        let e=document.getElementById(id);
        if(!e) {
            e=document.createElement('div');
            e.id=id;
            e.classList.add('Win');
            e.style.position='absolute';
            document.body.appendChild(e);
        }
        e.style.font=this.CSS();
        if(wrap_width) {
            e.style.width=`${max_width}px`;
        }else {
            e.style.width='';
        }
        e.innerText=text_begin;
        e.style.visibility='hidden';

        // console.log("CalTextSize", {
        //     text:text_begin,
        //     offset:{w:e.offsetWidth, h:e.offsetHeight},
        //     client:{w:e.clientWidth, h:e.clientHeight},
        //     scroll:{w:e.scrollWidth, h:e.scrollHeight},
        // })
        if(isready)
            isready[0]=true;
        return {x:e.offsetWidth,y:e.offsetHeight};
    }
    CSS():string {
        return `${this.style} ${this.size}px ${this.name}`;
    }

    name!:string;
    style!:string;
    size!:number;
}

interface RectDOM
{
    x:number
    y:number
    w:number
    h:number
}

class PaintWin implements IPaint
{
    constructor(backend:BackendDOM)
    {
        this.backend=backend;
    }

    Paint()
    {
        let obj=this.obj;
        let e=document.getElementById(`${obj._uid}`);
        if(!e) {
            e=this.Create() ;
            if(!e)
                return;
            e.id=`${obj._uid}`;
            if(obj.hint) {
                e.setAttribute("tip", obj.hint);
            }
            if(obj.Name)
                e.setAttribute('data-name', obj.Name);

            let parent=document.getElementById(`${this.backend.parent?._uid}`);
            if(parent) {
                let before=undefined;
                for(let ch of parent.children) {
                    let id=Number.parseInt(ch.id);
                    if(id>obj._uid) {
                        before=ch;
                        break;
                    }
                }
                if(before) {
                    parent.insertBefore(e, before);
                }else {
                    parent.append(e);                
                }
            }else if(this.backend.root) {
                this.backend.root.append(e);
            }else {
                document.body.append(e);
            }
            if(obj.isCanNotify) {
                //e.classList.add("notify-on");
            }else {
                e.classList.add("notify-off");
            }
            // if(obj.padding>0) {
            //     e.style.margin = `${obj.padding}px`;
            // }
            //e.style.position="fixed";
            //e.style.position='relative';
            e.style.position='absolute';
            if(obj.isResizable) {

                let resizer=document.createElement('div');
                resizer.classList.add("Resizer");
                resizer.onmousedown=(_e)=>{
                    console.log('resizer.onmousedown', _e);
                    this.isDragging=undefined;
                    _e.stopPropagation();
                }
                e.append(resizer);

                e.style.resize='both';
                e.style.overflow='auto';

                this.resizeobs=new ResizeObserver(entries=>{
                    for(let entry of entries) {
                        //console.log(entry);
                        this.isDragging=undefined;
                        obj.w=entry.borderBoxSize[0].inlineSize;
                        obj.h=entry.borderBoxSize[0].blockSize;
                        obj.SetCalRect();
                        obj._owner.isDirty=true;
                    }
                })
                this.resizeobs.observe(e);
            }

            document.addEventListener('mousemove',(_e)=>{
                this.OnMouseMove(e, obj, _e);
            })
            e.onmousemove=(_e)=>{
                if(obj.on_mousemove) {
                    obj.on_mousemove(_e.offsetX, _e.offsetY);
                }
                this.OnMouseMove(e, obj, _e);
            }
            e.onmousedown=(_e)=>{
                console.log(`mousedown`, _e, obj, this.isDragging);
                if(obj.on_mousedown) {
                    obj.on_mousedown(_e.offsetX, _e.offsetY);
                }
                if(obj.isCanDrag) {
                    if(obj.isResizable) {
                        if(_e.offsetX>obj.w-RESIZEBAR_SIZE && _e.offsetY>obj.h-RESIZEBAR_SIZE)
                            return;
                    }
                    this.ex=_e.x;
                    this.ey=_e.y;
                    this.ox=obj.x;
                    this.oy=obj.y;
                    this.isDragging=obj._uid;

                    document.addEventListener('mouseup', ()=>{
                        console.log('document.mouseup', e);
                        this.isDragging=undefined;
                    }, {once: true});
                }
                _e.stopPropagation();
            }
            e.onmouseup=(_e)=>{
                //console.log(`mouseup`, _e, obj);
                if(obj.on_mouseup) {
                    obj.on_mouseup(_e.offsetX, _e.offsetY);
                }
                this.isDragging=undefined;
                _e.stopPropagation();
            }

            if(obj.on_create) {
                obj.on_create(e);
            }
        }
        if(this.backend.visible_map[obj._uid] !== undefined) {
            console.log("[BackendDOM] PaintWin same uid", obj);
        }
        this.backend.visible_map[obj._uid]=true;
        if(obj.css_style) {
            for(let style in obj.css_style) {
                (<any>e.style)[style]=obj.css_style[style];
            }
        }
        this.SetRect(e, {x:obj._localPos.x, y:obj._localPos.y, w:obj.w, h:obj.h});
        if(obj.rotate!=0) {
            let deg=Math.floor(obj.rotate/Math.PI*180);
            e.style.transform=`rotate(${deg}deg)`;
        }
    }
    PaintEnd() {

    }

    OnMouseMove(e:HTMLElement|null, obj:zlUIWin, _e:MouseEvent) {
        if(obj.isCanDrag && this.isDragging == obj._uid) {
            obj.x=this.ox+(_e.x-this.ex)/obj._world.scale;
            obj.y=this.oy+(_e.y-this.ey)/obj._world.scale;
            if(obj.draglimit) {
                if((obj.draglimit.mode & EDragLimit.Left) && obj.x<obj.draglimit.x) {
                    obj.x=obj.draglimit.x;
                }
                if((obj.draglimit.mode & EDragLimit.Right) && obj.x>obj.draglimit.z) {
                    obj.x=obj.draglimit.z;
                }
                if((obj.draglimit.mode & EDragLimit.Top) && obj.y<obj.draglimit.y) {
                    obj.y=obj.draglimit.y;
                }
                if((obj.draglimit.mode & EDragLimit.Down) && obj.y>obj.draglimit.w) {
                    obj.y=obj.draglimit.w;
                }
            }
            obj.SetCalRect();
            this.SetPosition(e, obj, obj.x, obj.y);
        }
    }

    SetPosition(e:HTMLElement|null, obj:zlUIWin, x:number, y:number) {
        //console.log(`SetPosition ${obj._uid} ${x} ${y}`, e);
        let scale=obj._world.scale;
        let ox=0;
        let oy=0;

        if(this.backend.parent?._csid==zlUIMgr.CSID) {
            ox=obj._owner.x;
            oy=obj._owner.y;
        }
        let left=`${Math.floor(x*scale+ox)}px`;
        let top=`${Math.floor(y*scale+oy)}px`;
        if(e) {
            e.style.left=left;
            e.style.top=top;
        }
    }

    SetRect(e:HTMLElement, r:RectDOM) {
        //console.log(`SetRect`, r, e);
        let scale=this.obj._world.scale;
        let ox=0;
        let oy=0;

        if(this.backend.parent?._csid==zlUIMgr.CSID) {
            ox=this.obj._owner.x;
            oy=this.obj._owner.y;
        }
        if(e.style.display != 'inline-block') {
            e.style.display='inline-block';
        }
        let left=`${Math.floor(r.x*scale+ox)}px`;
        let top=`${Math.floor(r.y*scale+oy)}px`;
        let width=`${Math.floor(r.w*scale)}px`
        let height=`${Math.floor(r.h*scale)}px`
        if(e.style.left != left) {
            e.style.left=left;
        }
        if(e.style.top != top) {
            e.style.top=top;
        }
        if(e.style.width != width) {
            e.style.width=width;
        }
        if(e.style.height != height) {
            e.style.height=height;
        }        
    }

    Create(): HTMLElement {
        let e=document.createElement('div');
        e.classList.add('Win');
        return e;
    }

    CreateImage(obj:zlUIWin, image:TexturePack, onload?:(img:TexturePack)=>void): HTMLImageElement {
        let img=document.createElement('img') as HTMLImageElement;
        img.onload=()=>{
            if(!image.texture) {
                image.texture=new TextureDOM;
            }
            image.texture._width=img.width;
            image.texture._height=img.height;
            if(onload)
                onload(image);
            console.log("BackendDOM CreateImage", img, image);
        }
        let scale=this.obj._world.scale;
        img.id=`img_${obj._uid}`;
        img.width=obj.w*scale;
        img.height=obj.h*scale;
        img.src=`${obj._owner.path}${image.name}`;
        return img;
    }

    backend:BackendDOM;
    obj!:zlUIWin;

    isDragging?:number;
    ex!:number;
    ey!:number;
    ox!:number;
    oy!:number;

    resizeobs?:ResizeObserver;
}

class PaintMgr extends PaintWin
{
    constructor(backend:BackendDOM)
    {
        super(backend);
    }

    Paint()
    {
        let obj=this.obj as zlUIMgr;
        this.backend.visible_map={};
        this.backend.parent=undefined;
        this.SetRect(this.backend.root, {x:obj._localPos.x, y:obj._localPos.y, w:obj.w, h:obj.h})
    }
    PaintEnd()
    {
        for(let uid in this.backend.prev_visible_map) {
            if(this.backend.visible_map[uid] === undefined) {
                let e=document.getElementById(`${uid}`);
                //e.style.display='none';
                if(e) {
                    e.remove();
                }
            }
        }
        for(let uid in this.backend.visible_map) {
            this.backend.prev_visible_map[uid]=true;
        }
    }
}

class PaintImage extends PaintWin
{
    constructor(backend:BackendDOM)
    {
        super(backend);
    }

    Paint(): void {
        let obj=this.obj as zlUIImage;
        super.Paint();
        if(obj.image) {
            let e=document.getElementById(`${obj._uid}`) as HTMLDivElement;
            e.setAttribute('data-color', CSSrgba(obj.color, obj.alpha));
            e.setAttribute('data-alpha', `${obj.alpha}`);
            // let img=document.getElementById(`img_${obj._uid}`) as HTMLImageElement;
            // img.width=e.clientWidth;
            // img.height=e.clientHeight;
        }
    }

    Create(): HTMLElement {
        let e:HTMLElement=super.Create();
        e.style.border="none";
        e.style.borderRadius="0px";
        let obj=this.obj as zlUIImage;
        if(obj.image) {
            e.classList.add('Image');
            e.style.backgroundImage=`url(${obj._owner.path}${obj.image.name})`;
            // let img=this.CreateImage(obj, obj.image);
            // img.id=`img_${obj._uid}`;
            // img.classList.add('Image');
            // e.appendChild(img);
        }
        return e;
    }
}

class PaintPanel extends PaintWin
{
    constructor(backend:BackendDOM)
    {
        super(backend);
        this.has_label=true;
    }

    Paint()
    {
        let obj=this.obj as zlUIPanel;
        super.Paint();
        let e=document.getElementById(`${obj._uid}`) as HTMLDivElement;
    
        this.PaintText(e, obj);
        this.PaintPanel(e, obj);
    }

    LabelID():string {
        return `label_${this.obj._uid}`;
    }

    PaintText(e:HTMLElement, obj:zlUIPanel) {
        let label_id=`label_${obj._uid}`;
        let label=document.getElementById(label_id) as HTMLLabelElement;
        if(this.has_label && obj.text && obj.text.length>0 && obj.font) {
            let font=obj.font;
            let fontSize=Math.floor(font.size*obj._world.scale);
            //let fontstyle=`${font.style} ${fontSize}px ${font.name}`;
            //e.style.font=fontstyle;
            e.style.fontSize=`${fontSize}px`;
            e.style.fontFamily=font.name;
            e.style.fontStyle=font.style;
            
            this.textAlign(e);
            if(!label) {
                label=document.createElement('label') as HTMLLabelElement;
                label.id=label_id
                e.append(label);
            }            

            if(obj.textoffset) {
                label.style.paddingLeft=`${obj.textoffset.x}px`;
            }

            label.innerText=obj.text;
        }else if(label) {
            label.remove();
        }
    }

    PaintPanel(e:HTMLDivElement, obj:zlUIPanel) {
        e.setAttribute('data-color', CSSrgba(obj.color, obj.alpha));
        e.setAttribute('data-bordercolor', CSSrgba(obj.borderColor, obj.alpha));
        e.setAttribute('data-textcolor', CSSrgba(obj.textColor, obj.alpha));
        e.setAttribute('data-alpha', `${obj.alpha}`);
        e.setAttribute('data-border-width', `${obj.borderWidth}`);
        let borderRadius=`${obj.rounding}px`;
        if(e.style.borderRadius!=borderRadius) {
            e.style.borderRadius=borderRadius;
        }
        if(obj.drawBoard?.type == BoardType.NineGrid) {
            if(obj.drawBoard.image.texture) {
                let x2=obj.drawBoard.image.texture._width-obj.drawBoard.x2;
                let y2=obj.drawBoard.image.texture._height-obj.drawBoard.y2;
                e.setAttribute('data-border-left', `${obj.drawBoard.x1}`);
                e.setAttribute('data-border-right', `${x2}`);
                e.setAttribute('data-border-top', `${obj.drawBoard.y1}`);
                e.setAttribute('data-border-bottom', `${y2}`);
            }
        }
        else if(obj.isDrawBorder) {
            //e.style.border=`solid ${CSSrgba(obj.borderColor, obj.alpha)}`;
            e.style.borderStyle='solid';
        }else {
            e.style.border="none";
        }
        if(obj.isDrawClient) {

        }else {
            e.setAttribute('data-color', 'rgba(0,0,0,0)');
            //e.style.backgroundColor="rgba(0,0,0,0)";
        }
    }

    textAlign(e:HTMLElement) {
        let obj=this.obj as zlUIPanel;
        if(obj.textAnchor) {
            if(obj.textAnchor.mode & EAnchor.X) {
                switch(obj.textAnchor.x) {
                case 0:
                    e.style.textAlign="left";
                    break;
                case 0.5:
                    e.style.textAlign="center";
                    break;
                case 1:
                    e.style.textAlign="right";
                    break;
                }
            }
            if(obj.textAnchor.mode & EAnchor.Y) {
                switch(obj.textAnchor.y) {
                case 0:
                    e.style.lineHeight='1.5';
                    break;
                case 0.5:
                    e.style.lineHeight=`${Math.floor(obj.h*obj._world.scale)}px`;
                    break
                case 1:
                    break;
                }
            }
        }else {
            switch(obj.textAlignW) {                
            case Align.None:
            case Align.Left:
                e.style.textAlign="left";
                break;
            case Align.Center:
                e.style.textAlign="center";
                break;
            case Align.Right:
                e.style.textAlign="right";
                break;
            }
            switch(obj.textAlignH) {
            case Align.None:
            case Align.Top:
                e.style.lineHeight='1.5';
                break;
            case Align.Center:
                e.style.lineHeight=`${Math.floor(obj.h*obj._world.scale)}px`;
                break;
            case Align.Down:
                break;
            }
        }
    }

    Create(): HTMLElement {
        let obj=this.obj as zlUIPanel;
        let e=document.createElement('div');
        e.classList.add('Win');
        e.classList.add('Panel'); 
        if(obj.image) {
            e.classList.add('Image');
            e.style.backgroundImage=`linear-gradient(var(--data-color), var(--data-color)),url(${obj._owner.path}${obj.image.name})`;
            //e.style.backgroundImage=`url(${obj._owner.path}${obj.image.name})`;
        }
        if(obj.drawBoard) {
            switch(obj.drawBoard.type) {
            case BoardType.Image:
                e.classList.add('Image');
                e.style.backgroundImage=`url(${obj._owner.path}${obj.drawBoard.image.name})`;
                break;
            case BoardType.NineGrid:
                e.classList.add('NineGrid');
                e.style.borderImageSource=`url(${obj._owner.path}${obj.drawBoard.image.name})`;
                // e.style.backgroundImage=`url(${obj._owner.path}${obj.drawBoard.image.name})`;
                break;
            }
        }
        return e;
    }

    has_label:boolean;
}

class PaintButton extends PaintPanel
{
    constructor(backend:BackendDOM)
    {
        super(backend);
    }

    Paint()
    {
        let obj=this.obj as zlUIButton;
        super.Paint();
        let e=document.getElementById(`${obj._uid}`) as HTMLButtonElement
        e.setAttribute('data-colorhover', CSSrgba(obj.colorHover, obj.alpha));
        e.setAttribute('data-textcolorhover', CSSrgba(obj.textColorHover, obj.alpha));
        e.setAttribute('data-colordown', CSSrgba(obj.colorDown, obj.alpha));
        e.disabled=!obj.isEnable;

        if(obj.image) {
            let img=document.getElementById(`img_${obj._uid}`) as HTMLImageElement;
            this.SetRect(img, {x:obj._localPos.x, y:obj._localPos.y, w:obj.w, h:obj.h});
        }
    }

    Create(): HTMLElement {
        let e=document.createElement('button') as HTMLButtonElement;
        e.classList.add('Win');
        e.classList.add('Panel');
        let obj=this.obj as zlUIButton;
        e.type="button";

        if(obj.image) {
            let img=this.CreateImage(obj, obj.image);
            e.classList.add('ButtonImage');
            e.appendChild(img);
        }else {
            e.classList.add('Button');
        }
        if(obj.drawBoard) {
            switch(obj.drawBoard.type) {
            case BoardType.Image:
                e.classList.add('Image');
                e.style.backgroundImage=`url(${obj._owner.path}${obj.drawBoard.image.name})`;
                break;
            case BoardType.NineGrid:
                e.classList.add('NineGrid');
                e.style.borderImageSource=`url(${obj._owner.path}${obj.drawBoard.image.name})`;
                e.style.backgroundImage=`url(${obj._owner.path}${obj.drawBoard.image.name})`;
                break;
            }
        }

        if(obj.on_click) {
            e.onclick=(e)=>{
                obj.OnClick();
            }
        }else {
            e.onclick=null;
        }
        return e;
    }
}

class PaintCheck extends PaintButton
{
    constructor(backend:BackendDOM)
    {
        super(backend);
    }

    Paint()
    {
        let obj=this.obj as zlUICheck;
        super.Paint();
        //let e=document.getElementById(`${obj._uid}`) as HTMLButtonElement
        let chk=document.getElementById(this.CheckID()) as HTMLInputElement;
        chk.checked=obj.isChecked;
    }

    PaintText(e: HTMLElement): void {
        let obj=this.obj as zlUICheck;
        let span=document.getElementById(this.SpanID()) as HTMLSpanElement;
        if(obj.text && obj.text.length>0 && obj.font) {
            let font=obj.font;
            let fontSize=Math.floor(font.size*obj._world.scale);
            //let fontstyle=`${font.style} ${fontSize}px ${font.name}`;

            if(!span) {
                span=document.createElement('span') as HTMLSpanElement;
                span.id=this.SpanID();
                let label=document.getElementById(this.LabelID()) as HTMLLabelElement;
                label.append(span);
            }
            if(obj.textoffset) {
                span.style.paddingLeft=`${obj.textoffset.x}px`;
            }
            //span.style.font=fontstyle;
            span.style.fontSize=`${fontSize}px`;
            span.style.fontFamily=font.name;
            span.style.fontStyle=font.style;
            span.innerText=obj.text;
        }else if(span) {
            span.remove();
        }
    }

    CheckID():string {
        return `check_${this.obj._uid}`;
    }
    SpanID():string {
        return `span_${this.obj._uid}`;
    }

    Create(): HTMLElement {
        let obj = this.obj as zlUICheck;
        let e=document.createElement('div');
        e.classList.add('Win');
        e.classList.add('Panel');
        e.classList.add('Button');
        let label=document.createElement('label');
        label.id=this.LabelID();
        let chk=document.createElement('input');
        this.checkbox=chk;
        chk.id=this.CheckID();
        chk.name=chk.id;
        chk.type='checkbox';
        chk.checked=obj.isChecked;
        label.append(chk);

        let span=document.createElement('span');
        span.classList.add('CheckMark');
        if(!obj.isDrawCheck) {
            span.style.display='none';
        }
        label.append(span);
        
        label.setAttribute('for', chk.id);
        label.classList.add('Win');
        label.classList.add('Panel');
        label.classList.add('Button');
        label.classList.add('Check');
        label.setAttribute('data-color', 'rgba(0,0,0,0)');
        label.setAttribute('data-bordercolor', 'rgba(0,0,0,0)');
        e.append(label);

        chk.onchange=()=>{
            obj.OnClick();
        }
        return e;
    }

    checkbox!:HTMLInputElement;
}

class PaintCombo extends PaintButton
{
    constructor(backend:BackendDOM)
    {
        super(backend);
        this.has_label=false;
    }

    Paint()
    {
        let obj=this.obj as zlUICombo;
        super.Paint();
        let e=document.getElementById(`${obj._uid}`) as HTMLSelectElement;
        
        if(e.value != `${obj.combo_value}`) {
            e.value=`${obj.combo_value}`;
        }

        if(this.isComboItemChange(e, obj)) {
            this.CreateOption(e);
        }
        e.onchange=()=>{
            obj.SetComboValue(Number.parseInt(e.value));
        }
    }

    isComboItemChange(e:HTMLSelectElement, obj:zlUICombo):boolean
    {
        if(e.options.length!=obj.combo_items?.length)
            return true;
        for(let i=0;i<obj.combo_items.length;i++) {
            if(e.options[i].textContent!=obj.combo_items[i])
                return true;
        }
        return false;
    }

    CreateOption(e:HTMLSelectElement) {
        while(e.options.length>0) {
            e.remove(0);
        }
        let obj=this.obj as zlUICombo;
        if(obj.combo_items === undefined)
            return;
        let i=0;
        for(let item of obj.combo_items) {
            let opt=document.createElement('option');
            opt.value=`${i}`;
            opt.textContent=item;
            e.append(opt);
            i++;
        }
    }

    Create(): HTMLElement {
        let e=document.createElement('select');
        e.classList.add('Win');
        e.classList.add('Panel');
        e.classList.add('Combo');
        this.textAlign(e);
        this.CreateOption(e);
        return e;
    }

}

class PaintEdit extends PaintPanel
{
    constructor(backend:BackendDOM)
    {
        super(backend);
    }

    Paint()
    {
        let obj=this.obj as zlUIEdit;
        super.Paint();
        let e:HTMLInputElement|HTMLTextAreaElement;
        if(obj.isMultiline) {
            e=document.getElementById(`${obj._uid}`) as HTMLTextAreaElement
        }else {
            e=document.getElementById(`${obj._uid}`) as HTMLInputElement;
        }
        switch(obj.type) {
        case 'file':
            break;
        default:
            if(e.value!=obj.text) {
                e.value=obj.text;
            }
            break;
        }
    }

    Create(): HTMLElement {
        let obj=this.obj as zlUIEdit;
        let e:HTMLInputElement|HTMLTextAreaElement;
        if(obj.isMultiline) {
            let area=document.createElement('textarea') as HTMLTextAreaElement;
            area.style.resize='none';
            e=area;
        }else {
            let input=document.createElement('input') as HTMLInputElement;
            input.type=obj.type;
            e=input;
        }
        e.id=`${obj._uid}`;
        e.classList.add('Win');
        e.classList.add('Edit');
        e.disabled=!obj.isEnable;

        switch(obj.type) {
        case 'file':
            (<HTMLInputElement>e).accept=obj.accept;
            break;
        default:
            if(e.value!=obj.text) {
                e.value=obj.text;
            }
            break;
        }

        e.onfocus=(ev)=>{
            switch(obj.type) {
            case 'file':
                return;
            }
            e.value=obj.text;
            e.select();
        }
        e.onblur=(ev)=>{
            obj.SetText(e.value);
        }
        e.onchange=()=>{
            switch(obj.type) {
            case 'file':
                if(obj.on_file) {
                    let files=(<HTMLInputElement>e).files;
                    if(files) {
                        obj.on_file(files[0]);
                    }
                }
                return;
            }
            obj.SetText(e.value);
            if(e.value != obj.text)
                e.value=obj.text;
        }
        return e;
    }
}

class PaintSlider extends PaintPanel
{
    constructor(backend:BackendDOM)
    {
        super(backend);
    }

    Paint()
    {
        //let obj=this.obj as zlUISlider;
        super.Paint();
        //let e:HTMLElement=document.getElementById(`${obj._uid}`)

    }

    Create(): HTMLElement {
        let obj=this.obj as zlUISlider;
        let e=document.createElement('div');
        e.classList.add('Win');
        e.classList.add('Panel');
        //e.classList.add('Slider');

        switch(obj.scrollType) {
        case ESliderType.eHorizontal:
            e.style.overflowX='auto';
            e.style.overflowY='hidden';
            break;
        case ESliderType.eVertical:
            e.style.overflowX='hidden';
            e.style.overflowY='auto';
            break;
        case ESliderType.eBoth:
            e.style.overflow='auto';
            break;
        }

        return e;
    }
}

class PaintTree extends PaintSlider
{
    constructor(backend:BackendDOM)
    {
        super(backend);
    }

    Paint(): void {
        super.Paint();
        let obj=this.obj as zlUITree;
        let e=document.getElementById(`${obj._uid}`);
        if(!e)
            return;
        if(obj.treenodeChange) {
            e.innerHTML="";
            if(obj.treenode) {                
                this.CreateTreeNodeList(obj.treenode, e);
            }
            obj.treenodeChange=false;
        }else if(obj.expandTreeNode) {
            for(let tn of obj.expandTreeNode) {
                let li=document.getElementById(`li_${tn._uid}`);
                if(li) {
                    li.setAttribute('data-textcolor', CSSrgba(tn.textColor, tn.alpha));
                    li.setAttribute('data-colorhover', CSSrgba(tn.colorHover, tn.alpha))
                    if(tn.isChecked) {
                        li.setAttribute('data-color', CSSrgba(tn.colorDown, tn.alpha))
                    }else {
                        li.setAttribute('data-color', CSSrgba(tn.colorUp, tn.alpha))
                    }
                }
            }
        }
    }

    CreateTreeNodeList(tnlist:zlUITreeNode[], parent:HTMLElement)
    {
        let ul=document.createElement('ul');
        ul.classList.add('Win');
        ul.classList.add('Tree');
        ul.style.height="100%";
        parent.append(ul);
        for(let tn of tnlist) {
            this.CreateTreeNode(tn, ul);
        }
    }

    CreateTreeNode(tn:zlUITreeNode, parent:HTMLElement): HTMLElement
    {
        let li=document.createElement('li');
        li.id=`li_${tn._uid}`;
        li.setAttribute('data-textcolor', CSSrgba(tn.textColor, tn.alpha));
        li.setAttribute('data-colorhover', CSSrgba(tn.colorHover, tn.alpha))
        li.setAttribute('data-color', CSSrgba(tn.color, tn.alpha))
        let summary:HTMLElement;
        let details:HTMLDetailsElement;
        li.style.lineHeight=`${Math.floor(tn.h*tn._world.scale)}px`;
        if(tn.treenode?.length>0) {
            details=document.createElement('details');
            details.open=tn.open;
            summary=document.createElement('summary');
            summary.innerText=tn.text;
            li.append(details);
            details.append(summary);
            this.CreateTreeNodeList(tn.treenode, details);
        }else {
            summary=document.createElement('summary');
            summary.innerText=tn.text;
            li.append(summary);
        }
        parent.append(li)
        summary.onclick=()=>{
            if(details)
                tn.open=details.open;
            tn.OnClick();
            tn._owner.isDirty=true;
        }
        return li;
    }

    Create(): HTMLElement {
        let obj=this.obj as zlUITree;
        let e=super.Create();
        e.classList.add('Panel');
        return e;
    }
}

class PaintImageText extends PaintWin
{
    constructor(backend:BackendDOM) {
        super(backend);
    }

    Paint(): void {
        super.Paint();
        this.PaintImageText();
    }

    PaintImageText() {
        let obj=this.obj as zlUIImageText;
        let e=document.getElementById(`${obj._uid}`);
        if(!e)
            return;
        let text=e.getAttribute("imagetext");
        let id=0;
        if(text!==obj.text) {
            for(id=0;true;id++) {
                let img=document.getElementById(`img_${obj._uid}_${id}`);
                if(!img)
                    break;
                img.remove();
            }
            id=0;

            let scale=obj._world.scale;
            if(obj.imageText)
            for(let im of obj.imageText) {
                let img=this.CreateImage(obj, im.imageFont.texture);
                img.id=`img_${obj._uid}_${id}`;
                img.classList.add('Win');
                img.classList.add('Image');
                img.style.position='absolute';
                this.SetPosition(img, obj, im.x, im.y);
                img.width=im.imageFont.width*scale;
                img.height=im.imageFont.height*scale;
                e.appendChild(img);
                id++;
            }

            e.setAttribute("imagetext", obj.text);
        }
        id=0;
        let scale=obj._world.scale;
        if(obj.imageText)
        for(let im of obj.imageText) {
            let img=document.getElementById(`img_${obj._uid}_${id}`) as HTMLImageElement;
            this.SetPosition(img, obj, im.x, im.y);
            img.width=im.imageFont.width*scale;
            img.height=im.imageFont.height*scale;
            id++;
        }
    }

    // Create(): HTMLElement {
    //     let e=super.Create();
    //     let obj=this.obj as zlUIImageText;
    //     let scale=obj._world.scale;
    //     let id=0;
    //     for(let im of obj.imageText) {
    //         let img=this.CreateImage(obj, im.imageFont.texture);
    //         img.id=`img_${obj._uid}_${id}`;
    //         img.classList.add('Win');
    //         img.classList.add('Image');
    //         img.style.position='absolute';
    //         this.SetPosition(img, obj, im.x, im.y);
    //         img.width=im.imageFont.width*scale;
    //         img.height=im.imageFont.height*scale;
    //         e.appendChild(img);
    //         id++;
    //     }
    //     return e;
    // }

}

export class BackendDOM implements IBackend
{
    constructor(root:HTMLElement) {
        this.paint[zlUIWin.CSID]=new PaintWin(this);
        this.paint[zlUIMgr.CSID]=new PaintMgr(this);
        this.paint[zlUIImage.CSID]=new PaintImage(this);
        this.paint[zlUIPanel.CSID]=new PaintPanel(this);
        this.paint[zlUIButton.CSID]=new PaintButton(this);
        this.paint[zlUICheck.CSID]=new PaintCheck(this);
        this.paint[zlUICombo.CSID]=new PaintCombo(this);
        this.paint[zlUIEdit.CSID]=new PaintEdit(this);
        this.paint[zlUISlider.CSID]=new PaintSlider(this);
        this.paint[zlUILabelEdit.CSID]=new PaintPanel(this);
        this.paint[zlUIDatePicker.CSID]=new PaintPanel(this);
        this.paint[zlUITree.CSID]=new PaintTree(this);
        this.paint[zlUIImageText.CSID]=new PaintImageText(this);
        this.root=root;
    }

    async CreateTexture(url:string, toks:string[]):Promise<ITexture>
    {
        let tex=new TextureDOM;
        if(toks) {
            tex._width=Number.parseInt(toks[2]);
            tex._height=Number.parseInt(toks[3]);
        }
        return tex;
    }
    GetTexture(name: string): TexturePack {
        return {
            name:name,
            x1:0,
            y1:0,
            x2:0,
            y2:0,
            scale:1,
        }
    }

    CreateFont(name:string, size:number, style:string):IFont {
        let font=new FontDOM;
        font.name=name;
        font.style=style;
        font.size=size;
        return font;
    }
    DefaultFont():IFont
    {
        if(!this.font) {
            this.font=this.CreateFont("Arial",16,"normal");
        }
        return this.font;
    }
    PushClipRect(rect:Rect) {
        
    }
    PopClipRect() {

    }
    Paint(obj:zlUIWin) {
        let paint=this.paint[obj._csid];
        if(paint === undefined) {
            console.warn("BackendDOM TODO", obj._csid);
            return;
        }
        paint.obj=obj;
        paint.Paint();
        paint.obj=undefined;
    }
    PaintEnd(obj:zlUIWin) {
        let paint=this.paint[obj._csid];
        if(paint === undefined)
            return;
        paint.obj=obj;
        paint.PaintEnd();
        paint.obj=undefined;
    }

    SetParent(obj: zlUIWin) {
        this.parent = obj;
    }
 
    paint:{[key:string]:IPaint} = {};
    font?:FontDOM;
    parent?:zlUIWin;
    root:HTMLElement;
    visible_map:{[key:number]:boolean} = {};
    prev_visible_map:{[key:number]:boolean} = {};
}