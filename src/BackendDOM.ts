import { Align, EAnchor, ESliderType, IBackend, IFont, IPaint, ITexture, IVec2, Rect, UIMgr, zlUIButton, zlUICheck, zlUICombo, zlUIEdit, zlUIEditItem, zlUIMgr, zlUIPanel, zlUISlider, zlUIWin } from "./zlUI";

function CSSrgba(c:number, alpha:number):string
{
    const r=c&0xff;
    const g=(c>>8)&0xff;
    const b=(c>>16)&0xff;
    const a=((c>>>24)&0xff)/255.0*alpha;
    return `rgba(${r},${g},${b},${a})`;
}

class TextureDOM implements ITexture
{
    Destroy() {

    }

    _texture:WebGLTexture;
    _width:number;
    _height:number;
}

class FontDOM implements IFont
{
    constructor()
    {

    }

    AddFontRange(start:number, end:number) {}
    MergeFont(font:IFont) {}
    CalTextSize(size: number, max_width: number, wrap_width: number, text_begin: string,
            text_end: number | null,
            isready:boolean[]) :IVec2
    {
        return {x:0,y:0};
    }
    CSS():string {return `${this.style} ${this.size}px ${this.name}`;}

    name:string;
    style:string;
    size:number;
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
            e.id=`${obj._uid}`;
            if(obj.hint) {
                e.setAttribute("tip", obj.hint);
            }
            
            let parent=document.getElementById(`${this.backend.parent._uid}`);

            if(parent) {
                parent.append(e);
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

            e.onmousemove=(e)=>{
                if(obj.on_mousemove) {
                    obj.on_mousemove(e.offsetX, e.offsetY);
                }
            }
            e.onmousedown=(e)=>{
                if(obj.on_mousedown) {
                    obj.on_mousedown(e.offsetX, e.offsetY);
                }
            }
            e.onmouseup=(e)=>{
                if(obj.on_mouseup) {
                    obj.on_mouseup(e.offsetX, e.offsetY);
                }
            }
        }
        if(this.backend.visible_map[obj._uid] !== undefined) {
            console.log("[BackendDOM] PaintWin same uid", obj);
        }
        this.backend.visible_map[obj._uid]=true;

        this.SetRect(e, {x:obj._localPos.x, y:obj._localPos.y, w:obj.w, h:obj.h});
    }
    PaintEnd() {

    }

    SetRect(e:HTMLElement, r:RectDOM) {
        let scale=this.obj._world.scale;
        let ox=0;
        let oy=0;

        if(this.backend.parent?._csid==UIMgr.CSID) {
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

    backend:BackendDOM;
    obj:zlUIWin;
}

class PaintMgr extends PaintWin
{
    constructor(backend:BackendDOM)
    {
        super(backend);
    }

    Paint()
    {
        let obj=this.obj as UIMgr;
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

class PaintPanel extends PaintWin
{
    constructor(backend:BackendDOM)
    {
        super(backend);
    }

    Paint()
    {
        let obj=this.obj as zlUIPanel;
        super.Paint();
        let e=document.getElementById(`${obj._uid}`) as HTMLDivElement;
    
        this.PaintText(e);
        this.PaintPanel(e);
    }

    PaintText(e:HTMLDivElement) {
        let obj=this.obj as zlUIPanel;
        let label_id=`label_${obj._uid}`;
        let label=document.getElementById(label_id) as HTMLLabelElement;
        if(obj.text && obj.text.length>0) {
            let font=obj._owner.GetFont(obj.fontIndex);
            let fontstyle=`${font.style} ${Math.floor(font.size*obj._world.scale)}px ${font.name}`;
            e.style.font=fontstyle;

            this.textAlign(e);
            if(!label) {
                label=document.createElement('label') as HTMLLabelElement;
                label.id=label_id
                e.append(label);
            }            
            label.textContent=obj.text;
        }else if(label) {
            label.remove();
        }
    }
    PaintPanel(e:HTMLDivElement) {
        let obj=this.obj as zlUIPanel;
        e.setAttribute('data-color', CSSrgba(obj.color, obj.alpha));
        e.setAttribute('data-bordercolor', CSSrgba(obj.borderColor, obj.alpha));
        e.setAttribute('data-textcolor', CSSrgba(obj.textColor, obj.alpha));
        let borderRadius=`${obj.rounding}px`;
        if(e.style.borderRadius!=borderRadius) {
            e.style.borderRadius=borderRadius;
        }
        if(obj.isDrawBorder) {
            let borderWidth=`${obj.borderWidth}px`;
            if(e.style.borderStyle!='solid') {
                e.style.borderStyle="solid";
            }
            if(e.style.borderWidth!=borderWidth) {
                e.style.borderWidth=borderWidth;
            }
        }else {
            e.style.borderStyle="none";
        }
        if(obj.isDrawClient) {

        }else {
            e.style.backgroundColor="rgba(0,0,0,0)";
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
            }
        }
    }

    Create(): HTMLElement {
        let obj=this.obj as zlUIPanel;
        let e=document.createElement('div');
        e.classList.add('Win');
        e.classList.add('Panel'); 
        return e;
    }
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
    }

    Create(): HTMLElement {
        let e=document.createElement('button');
        e.classList.add('Win');
        e.classList.add('Button');
        let obj=this.obj as zlUIButton;
        if(obj.on_click) {
            e.onclick=(e)=>{
                obj.OnClick();
            }
        }else {
            e.onclick=undefined;
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
        let e=document.getElementById(`${obj._uid}`) as HTMLButtonElement

        e.onclick=()=>{
            obj.isChecked=!obj.isChecked;
            this.checkbox.checked=obj.isChecked;
        }
    }

    CheckID():string {
        return `check_${this.obj._uid}`;
    }

    Create(): HTMLElement {
        let e=document.createElement('button');
        let chk=document.createElement('input');
        this.checkbox=chk;
        chk.id=this.CheckID();
        chk.type='checkbox';
        e.append(chk);
        e.classList.add('Win');
        e.classList.add('Check');
        let obj=this.obj as zlUICheck;
        chk.onchange=()=>{
            obj.isChecked=chk.checked;
        }
        return e;
    }

    checkbox:HTMLInputElement;
}

class PaintCombo extends PaintButton
{
    constructor(backend:BackendDOM)
    {
        super(backend);
    }

    Paint()
    {
        let obj=this.obj as zlUICombo;
        super.Paint();
        let e=document.getElementById(`${obj._uid}`) as HTMLSelectElement;
        
        if(this.isComboItemChange(e, obj)) {
            this.CreateOption(e);
        }
        e.onchange=()=>{
            obj.SetComboValue(Number.parseInt(e.value));
        }
    }

    isComboItemChange(e:HTMLSelectElement, obj:zlUICombo):boolean
    {
        if(e.options.length!=obj.combo_items.length)
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
        e.classList.add('Combo');
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

        switch(obj.type) {
        case 'file':
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
        }
        e.onblur=(ev)=>{
            obj.text=e.value;
        }
        e.onchange=()=>{
            switch(obj.type) {
            case 'file':
                if(obj.on_file) {
                    obj.on_file((<HTMLInputElement>e).files[0]);
                }
                return;
            }
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

class PaintEditItem extends PaintPanel
{
    constructor(backend:BackendDOM)
    {
        super(backend);
    }

    Paint()
    {
        let obj=this.obj as zlUIEditItem;
        super.Paint();

        if(obj.value !== undefined) {
            let id=0;
            for(let value of obj.value) {
                let input_id=`input_${obj._uid}_${id}`;
                let input=document.getElementById(input_id) as HTMLInputElement;
                if(typeof value === 'string') {
                    if(input.value!=value) {
                        input.value=value;
                    }
                }
                id++;
            }
        }
    }

    PaintText(e:HTMLDivElement) {
    }

    Create(): HTMLElement {
        let obj=this.obj as zlUIEditItem;
        let e=document.createElement('div');
        e.classList.add('Win');
        e.classList.add('Panel');         

        let label_id=`label_${obj._uid}`;
        let label=document.createElement('label') as HTMLLabelElement;
        label.id=label_id
        label.textContent=obj.text;
        this.SetRect(label, {x:0, y:0, w:obj.label_width, h:obj.h});
        this.textAlign(label);
        e.append(label);
        let value_width=obj.w-obj.label_width;
        let vx=obj.label_width;

        if(obj.value !== undefined) {
            let id=0;
            let values=obj.value;

            let vw=values.length>1 ? value_width/values.length:value_width;

            for(let value of values) {
                let input=document.createElement('input')as HTMLInputElement;
                input.classList.add('Win');
                input.setAttribute('type', obj.type);
                this.SetRect(input, {x:vx, y:0, w:vw-1, h:obj.h-1});
                vx+=vw;

                let input_id=`input_${obj._uid}_${id}`;
                input.id=input_id;
                input.value=value;
                input.setAttribute('index', `${id}`);
                input.onchange=(e)=>{
                    console.log(e);
                    let inx=Number.parseInt(input.getAttribute('index'));
                    switch(input.type) {
                    case 'file':
                        obj.value[inx]=input.files.length>0? input.files[0]:null;
                        break;
                    default:
                        obj.value[inx]=input.value;
                        break;
                    }
                    if(obj.on_edit!==undefined) {
                        obj.on_edit(obj.value);
                    }
                }

                label.append(input);
                id++;
            }
        }
        return e;
    }

}

export class BackendDOM implements IBackend
{
    constructor(root:HTMLElement) {
        this.paint[zlUIWin.CSID]=new PaintWin(this);
        this.paint[zlUIMgr.CSID]=new PaintMgr(this);
        this.paint[zlUIPanel.CSID]=new PaintPanel(this);
        this.paint[zlUIButton.CSID]=new PaintButton(this);
        this.paint[zlUICheck.CSID]=new PaintCheck(this);
        this.paint[zlUICombo.CSID]=new PaintCombo(this);
        this.paint[zlUIEdit.CSID]=new PaintEdit(this);
        this.paint[zlUISlider.CSID]=new PaintSlider(this);
        this.paint[zlUIEditItem.CSID]=new PaintEditItem(this);
        this.root=root;
    }

    async CreateTexture(url:string):Promise<ITexture>
    {
        let tex=new TextureDOM;
        return tex;
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

        }
        return this.font;
    }
    PushClipRect(rect:Rect) {
        
    }
    PopClipRect() {

    }
    Paint(obj:zlUIWin) {
        let paint=this.paint[obj._csid];
        if(paint === undefined)
            return;
        paint.obj=obj;
        paint.Paint();
        paint.obj=null;
    }
    PaintEnd(obj:zlUIWin) {
        let paint=this.paint[obj._csid];
        if(paint === undefined)
            return;
        paint.obj=obj;
        paint.PaintEnd();
        paint.obj=null;
    }

    SetParent(obj: zlUIWin) {
        this.parent = obj;
    }
 
    paint:{[key:string]:IPaint} = {};
    font:FontDOM;
    parent:zlUIWin;
    root:HTMLElement;
    visible_map:{[key:number]:boolean} = {};
    prev_visible_map:{[key:number]:boolean} = {};
}