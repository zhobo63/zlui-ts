import { IBackend, IFont, ITexture, IVec2, Rect, zlUIButton, zlUICheck, zlUICombo, zlUIEdit, zlUIImage, zlUIImageText, zlUIPanel, zlUISlider, zlUITree, zlUITreeNodeOpen, zlUIWin } from "./zlUI";

class DOMTexture implements ITexture
{
    Destroy() {

    }

    _texture:WebGLTexture;
    _width:number;
    _height:number;
}

class DOMFont implements IFont
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

    name:string;
    style:string;
    size:number;

}

export class BackendDOM implements IBackend
{

    async CreateTexture(url:string):Promise<ITexture>
    {
        let tex=new DOMTexture;
        return tex;
    }
    CreateFont(name: string, size: number, style: string):IFont
    {
        let font=new DOMFont;
        font.name=name;
        font.style=style;
        font.size=size;
        return font;
    }
    DefaultFont():IFont
    {
        if(!this.font) {
            //this.font=this.CreateFont();
        }
        return this.font;
    }
    PushClipRect(rect:Rect) {}
    PopClipRect() {}

    PaintUIWin(obj:zlUIWin) {}
    PaintUIImage(obj:zlUIImage) {}
    PaintUIPanel(obj:zlUIPanel) {}
    PaintUIEdit(obj:zlUIEdit) {}
    PaintUIButton(obj:zlUIButton) {}
    PaintUICheck(obj:zlUICheck) {}
    PaintUICombo(obj:zlUICombo) {}
    PaintUISlider(obj:zlUISlider) {}
    PaintUIImageText(obj:zlUIImageText) {}
    PaintUITree(obj:zlUITree) {}
    PaintUITreeNodeOpen(obj:zlUITreeNodeOpen) {}

    font:DOMFont;
}
