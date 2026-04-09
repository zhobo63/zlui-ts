import { BackendDOM } from './BackendDOM';
import { BackendImGui, InspectorUI } from './BackendImGui';
import {zlUIMgr, zlUIWin, zlUIImage, zlUIPanel, zlUIButton, zlUIEdit, zlUICheck, zlUICombo, zlUISlider, zlTexturePack, zlTrack, zlTrackGroup, zlTrackMgr, zlUIImageText, zlUIInspector} from './zlUI';
export {zlUIMgr, zlUIWin, zlUIImage, zlUIPanel, zlUIButton, zlUIEdit, zlUICheck, zlUICombo, zlUISlider, zlTexturePack, zlTrack, zlTrackGroup, zlTrackMgr, zlUIImageText, zlUIInspector}

export {LoadImage, Panel, Edit, Button, Check, Combo, Inside, ParseBool, ParseText, ParseColor} from "./zlUI"
export {stringToColorHex, toColorHex, fromColorHex} from "./zlUI"
export {OnLoadable, Align, EAutosize, IAutosize, ESliderType, ScaleMode, TexturePack, Board, EAnchor, IAnchor, EDock, IDock, Vec2, Vec4, EArrange, EDirection, IArrange} from "./zlUI"

export {Bezier} from "./zlUI"

import * as zlUI from "./zlUI"
export {zlUI}

import {ImGui, ImGui_Impl} from '@zhobo63/imgui-ts';
import {ImVec4 } from '@zhobo63/imgui-ts/src/imgui';

let lockTime=0;
let lockFps=1/30;
let prevTime=0;

class App
{
    constructor()
    {

    }

    async initialize()
    {
        let inspector=document.getElementById("inspector");
        if(inspector) {
            this.inspector=new zlUIInspector(new zlUIMgr);
            // this.inspector.mgr.w=400;
            // this.inspector.mgr.h=600;
            this.inspector.mgr.backend=new BackendDOM(inspector);
            await this.inspector.mgr.Load("dark.ui", "res/");
            await this.inspector.mgr.Load("button.ui", "res/");
            this.inspector.mgr.SetCalRect();
            this.inspector.mgr.isDirty=true;
        }
        this.ui=new zlUIMgr;
        this.ui.backend=new BackendImGui(ImGui.GetBackgroundDrawList());
        await this.ui.Load("main.ui", "res/");
        this.ui.on_click=(obj:zlUIWin)=>{
            console.log("click", obj);
        };  
        this.ui.on_notify=(obj:zlUIWin)=>{
            console.log("notify", obj);
        };  
        this.ui.on_dragstart=(obj:zlUIWin)=>{
            console.log("on_dragstart", obj);
        };
        this.ui.on_dragover=(obj:zlUIWin, drag:zlUIWin)=>{
            console.log("on_dragover", obj, drag);
            return true;
        };
        this.ui.on_drop=(obj:zlUIWin, drop:zlUIWin)=>{
            console.log("on_drop", obj, drop);
            return true;
        };
        let ed444=this.ui.GetUI("ed_treenode444");
        if(ed444) {
            ed444.on_drop=(obj:zlUIWin, drop:zlUIWin)=>{
                if(drop.Name)
                    obj.SetText(drop.Name);
                return true;
            };
        }
    }

    mainLoop(time:number, drawlist:ImGui.DrawList)
    {
        if(!this.ui)
            return;
        let io=ImGui.GetIO();
        let ui=this.ui;
        ui.any_pointer_down=(!ImGui.GetHoveredWindow())?ImGui_Impl.any_pointerdown():false;
        ui.mouse_pos.Set(io.MousePos.x, io.MousePos.y);
        ui.mouse_wheel=io.MouseWheel;
        ui.Refresh(io.DeltaTime);
        ui.Paint();        
        if(ui.calrect_count>0) {
            ui.isDirty=true;
        }
        //this.isDirty=true;
        ImGui.Begin("Inspector");
        ImGui.Text("Notify:"+(ui.notify?ui.notify.Name:"(null)"));
        if(ui.notify) {
            ImGui.SameLine();
            if(ImGui.Button("CalRect")) {
                ui.notify.SetCalRect();
            }
        }
        ImGui.Text("refresh:" + ui.refresh_count);
        ImGui.Text("paint:" + ui.paint_count);
        ImGui.Text("calrect:" + ui.calrect_count);
        if(ImGui.TreeNode("UIMgr")){
            InspectorUI(ui,1);
            ImGui.TreePop();
        }

        ImGui.End();

        if(this.inspector) {
            this.inspector.mgr.any_pointer_down=ui.any_pointer_down;
            this.inspector.Inspect(ui);
            let r=this.inspector.mgr.Refresh(io.DeltaTime);
            if(!r && this.inspector.mgr.isDirty) {
                this.inspector.mgr.Paint();
            }
        }
    }

    onResize(width:number, height:number)
    {
        if(this.ui) {
            this.ui.w=width;
            this.ui.h=height;
            this.ui.SetCalRect();
        }
    }
    onMessage(msg:any)
    {
        console.log(msg);
    }

    ui?:zlUIMgr;
    default_font?:ImGui.Font;
    inspector?:zlUIInspector;
}
    
let app:App;
let backgroundColor:ImVec4;

function _loop(time:number):void {
    let ti=(time-prevTime)*0.001;
    prevTime=time;
    lockTime+=ti;
    if(lockTime<lockFps && !app.ui?.isDirty)  {
        window.requestAnimationFrame(_loop);
        return;
    }
    lockTime=0;

    ImGui_Impl.NewFrame(time);
    ImGui.NewFrame();

    if(app) {
        app.mainLoop(time, ImGui.GetBackgroundDrawList());
    }

    ImGui.EndFrame();
    ImGui.Render();

    ImGui_Impl.ClearBuffer(backgroundColor);
    ImGui_Impl.RenderDrawData(ImGui.GetDrawData());

    window.requestAnimationFrame(_loop);
}

function anyPointer(e:Event)
{
    if(app.ui)
        app.ui.isDirty=true;
}

window.addEventListener('DOMContentLoaded', async () =>{
    await ImGui.default();
    ImGui.CHECKVERSION();
    ImGui.CreateContext();
    let io=ImGui.GetIO();
    let font=io.Fonts.AddFontDefault();
    font.FontName="arial";
    font.FontStyle="bold";
    font.FontSize=16;    
    if(ImGui.isMobile.any())    {
        font.FontSize=20;
    }

    const canvas:HTMLCanvasElement=document.getElementById('canvas') as HTMLCanvasElement;
    let gl = canvas.getContext("webgl2", { alpha: true }) || canvas.getContext("webgl", { alpha: true });
    ImGui_Impl.Init(gl);

    console.log("FontScale", ImGui_Impl.font_scale);
    console.log("CanvasScale", ImGui_Impl.canvas_scale);

    app=new App;
    app.default_font=font;
    await app.initialize();
    if(app) {
        app.onResize(canvas.scrollWidth, canvas.scrollHeight);
    }

    window.addEventListener("pointerdown", anyPointer);
    window.addEventListener("pointerup", anyPointer);
    window.addEventListener("pointermove", anyPointer);
    window.addEventListener("keydown", anyPointer);
    window.addEventListener("keyup", anyPointer);
    window.addEventListener("keypress", anyPointer);
    window.addEventListener("message", e=>{app.onMessage(e.data);});

    window.onresize=()=>{
        if(app) {app.onResize(canvas.scrollWidth, canvas.scrollHeight);}
    };

    backgroundColor=new ImVec4(23/255,26/255,29/255,0);
   
    window.requestAnimationFrame(_loop);
});


