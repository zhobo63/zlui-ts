import { Align, EAnchor, EDragLimit, ESliderType, IBackend, IFont, IPaint, ITexture, IVec2, Rect, UICheck, UIMgr, UIWin, zlUIButton, zlUICheck, zlUICombo, zlUIDatePicker, zlUIEdit, zlUILabelEdit, zlUIMgr, zlUIPanel, zlUISlider, zlUITree, zlUITreeNode, zlUITreeNodeOpen, zlUIWin } from "./zlUI";

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
        
        isready[0]=true;
        return {x:e.offsetWidth,y:e.offsetHeight};
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
            e.setAttribute('data-name', obj.Name);
            
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

            if(obj.isResizable) {
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
                //console.log(`mousedown`, _e, obj, this.isDragging);
                if(obj.on_mousedown) {
                    obj.on_mousedown(_e.offsetX, _e.offsetY);
                }
                if(obj.isCanDrag) {
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

        this.SetRect(e, {x:obj._localPos.x, y:obj._localPos.y, w:obj.w, h:obj.h});
    }
    PaintEnd() {

    }

    OnMouseMove(e:HTMLElement, obj:UIWin, _e:MouseEvent) {
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

    SetPosition(e:HTMLElement, obj:UIWin, x:number, y:number) {
        //console.log(`SetPosition ${obj._uid} ${x} ${y}`, e);
        let scale=obj._world.scale;
        let ox=0;
        let oy=0;

        if(this.backend.parent?._csid==UIMgr.CSID) {
            ox=obj._owner.x;
            oy=obj._owner.y;
        }
        let left=`${Math.floor(obj.x*scale+ox)}px`;
        let top=`${Math.floor(obj.y*scale+oy)}px`;
        e.style.left=left;
        e.style.top=top;
    }

    SetRect(e:HTMLElement, r:RectDOM) {
        //console.log(`SetRect`, r, e);
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

    isDragging:number;
    ex:number;
    ey:number;
    ox:number;
    oy:number;

    resizeobs:ResizeObserver;
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
        this.has_label=true;
    }

    Paint()
    {
        let obj=this.obj as zlUIPanel;
        super.Paint();
        let e=document.getElementById(`${obj._uid}`) as HTMLDivElement;
    
        this.PaintText(e);
        this.PaintPanel(e);
    }

    LabelID():string {
        return `label_${this.obj._uid}`;
    }

    PaintText(e:HTMLElement) {
        let obj=this.obj as zlUIPanel;
        let label_id=`label_${obj._uid}`;
        let label=document.getElementById(label_id) as HTMLLabelElement;
        if(this.has_label && obj.text && obj.text.length>0) {
            let font=obj._owner.GetFont(obj.fontIndex);
            let fontstyle=`${font.style} ${Math.floor(font.size*obj._world.scale)}px ${font.name}`;
            e.style.font=fontstyle;

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
            e.style.border=`${obj.borderWidth}px solid ${CSSrgba(obj.borderColor, obj.alpha)}`;
        }else {
            e.style.border="none";
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
    }

    Create(): HTMLElement {
        let e=document.createElement('button');
        e.classList.add('Win');
        e.classList.add('Panel');
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
        //let e=document.getElementById(`${obj._uid}`) as HTMLButtonElement
        let chk=document.getElementById(this.CheckID()) as HTMLInputElement;
        chk.checked=obj.isChecked;
    }

    PaintText(e: HTMLElement): void {
        let obj=this.obj as zlUICheck;
        let span=document.getElementById(this.SpanID()) as HTMLSpanElement;
        if(obj.text && obj.text.length>0) {
            let font=obj._owner.GetFont(obj.fontIndex);
            let fontstyle=`${font.style} ${Math.floor(font.size*obj._world.scale)}px ${font.name}`;

            if(!span) {
                span=document.createElement('span') as HTMLSpanElement;
                span.id=this.SpanID();
                let label=document.getElementById(this.LabelID()) as HTMLLabelElement;
                label.append(span);
            }
            if(obj.textoffset) {
                span.style.paddingLeft=`${obj.textoffset.x}px`;
            }
            span.style.font=fontstyle;
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
        let obj = this.obj as UICheck;
        let e=document.createElement('div');
        e.classList.add('Win');
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
        e.append(label);

        chk.onchange=()=>{
            obj.OnClick();
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
                    obj.on_file((<HTMLInputElement>e).files[0]);
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
        if(obj.treenodeChange) {
            e.innerHTML="";
            if(obj.treenode) {                
                this.CreateTreeNodeList(obj.treenode, e);
            }
            obj.treenodeChange=false;
        }else if(obj.expandTreeNode) {
            for(let tn of obj.expandTreeNode) {
                let li=document.getElementById(`li_${tn._uid}`);
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

    CreateTreeNodeList(tnlist:zlUITreeNode[], parent:HTMLElement)
    {
        let ul=document.createElement('ul');
        ul.classList.add('Win');
        ul.classList.add('Tree');
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
        e.id=`${obj._uid}`
        e.classList.add('Panel');

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
        this.paint[zlUILabelEdit.CSID]=new PaintPanel(this);
        this.paint[zlUIDatePicker.CSID]=new PaintPanel(this);
        this.paint[zlUITree.CSID]=new PaintTree(this);
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