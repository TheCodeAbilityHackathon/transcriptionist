#include <MsgBoxConstants.au3>
#include <GuiTab.au3>
#include <WinAPICOM.au3>
#include <WinAPI.au3>
#include <Constants.au3>
#include <WindowsConstants.au3>

Global Const $sCLSID_MMDeviceEnumerator = "{BCDE0395-E52F-467C-8E3D-C4579291692E}"
Global Const $sIID_IMMDeviceEnumerator = "{A95664D2-9614-4F35-A746-DE8DB63617E6}"
Global Const $tagIMMDeviceEnumerator = "EnumAudioEndpoints hresult(int;int;ptr*);" & _
        "GetDefaultAudioEndpoint hresult(int;int;ptr*);" & _
        "GetDevice hresult(wstr;ptr*);" & _
        "RegisterEndpointNotificationCallback hresult(ptr);" & _
        "UnregisterEndpointNotificationCallback hresult(ptr);"

Global Const $IID_IMMDevice = "{D666063F-1587-4E43-81F1-B948E807363F}"
Global Const $tagIMMDevice = "Activate hresult(ptr;dword;variant*;ptr*);" & _
        "OpenPropertyStore hresult(dword;ptr*);" & _
        "GetId hresult(ptr*);" & _
        "GetState hresult(dword*);"

Global Const $IID_IPropertyStore = "{886d8eeb-8cf2-4446-8d02-cdba1dbdcf99}"
Global Const $tagIPropertyStore = "GetCount hresult(dword*);" & _
        "GetAt hresult(dword;ptr*);" & _
        "GetValue hresult(struct*;variant*);" & _
        "SetValue hresult(struct*;variant);" & _
        "Commit hresult();"

Global Const $sPKEY_Device_FriendlyName = "{a45c254e-df1c-4efd-8020-67d146a850e0} 14"

Global Const $STGM_READ = 0
Global Const $DEVICE_STATE_ACTIVE = 0x00000001

Global Const $eRender = 0
Global Const $eCapture = 1
Global Const $eAll = 2
Global Const $EDataFlow_enum_count = 3

Global Const $eConsole = 0
Global Const $eMultimedia = 1
Global Const $eCommunications = 2
Global Const $ERole_enum_count = 3

Func _WinAPI_PKEYFromString($sPKEY, $pID = Default)
    Local $tPKEY = DllStructCreate("byte GUID[16]; dword PID;")
    DllCall("propsys.dll", "long", "PSPropertyKeyFromString", "wstr", $sPKEY, "struct*", $tPKEY)
    If $pID <> Default Then DllStructSetData($tPKEY, "PID", $pID)
    Return $tPKEY
EndFunc
;==========================================================
Func getAudio()
Local $oEnumerator = ObjCreateInterface($sCLSID_MMDeviceEnumerator, $sIID_IMMDeviceEnumerator, $tagIMMDeviceEnumerator)

Local $pDefaultEndpoint
$oEnumerator.GetDefaultAudioEndpoint($eRender, $DEVICE_STATE_ACTIVE, $pDefaultEndpoint)

Local $oEndpoint = ObjCreateInterface($pDefaultEndpoint, $IID_IMMDevice, $tagIMMDevice)

; PropertyStore stores properties
Local $pProps
$oEndpoint.OpenPropertyStore($STGM_READ, $pProps)
$oProps = ObjCreateInterface($pProps, $IID_IPropertyStore, $tagIPropertyStore)

; Collect FriendlyName property
Local $tPKEY_Device_FriendlyName = _WinAPI_PKEYFromString($sPKEY_Device_FriendlyName)
Local $sName
$oProps.GetValue($tPKEY_Device_FriendlyName, $sName)
Return $sName
EndFunc

Func getRecording()
Local $oEnumerator = ObjCreateInterface($sCLSID_MMDeviceEnumerator, $sIID_IMMDeviceEnumerator, $tagIMMDeviceEnumerator)

Local $pDefaultEndpoint
$oEnumerator.GetDefaultAudioEndpoint($eCapture, $DEVICE_STATE_ACTIVE, $pDefaultEndpoint)

Local $oEndpoint = ObjCreateInterface($pDefaultEndpoint, $IID_IMMDevice, $tagIMMDevice)

; PropertyStore stores properties
Local $pProps
$oEndpoint.OpenPropertyStore($STGM_READ, $pProps)
$oProps = ObjCreateInterface($pProps, $IID_IPropertyStore, $tagIPropertyStore)

; Collect FriendlyName property
Local $tPKEY_Device_FriendlyName = _WinAPI_PKEYFromString($sPKEY_Device_FriendlyName)
Local $sName
$oProps.GetValue($tPKEY_Device_FriendlyName, $sName)
Return $sName
EndFunc

Global $output = 0;
Global $input = 0;
If ((StringInStr("CABLE Input (VB-Audio Virtual Cable)",getAudio())<1) OR (StringInStr("CABLE Output (VB-Audio Virtual Cable)",getRecording())<1)) Then
MsgBox($MB_SYSTEMMODAL,"MówMi","Cześć. Do poprawnej pracy Aplikacji MówMi , musisz odpowiednio ustawic swoje urzadzenia audio." & @LF & "Spokojnie - poprowadzimy Cię krok po kroku!")
EndIf
While (StringInStr("CABLE Input (VB-Audio Virtual Cable)",getAudio())<1)
   MsgBox($MB_SYSTEMMODAL, "MówMi", "Ok, sprawdź teraz czy jako twoje główne źródło dzwięku ustawiony jest:" & @LF & "CABLE Input (VB-Audio Virtual Cable)" , 10)
   RunWait(@SystemDir & "\rundll32.exe Shell32.dll,Control_RunDLL " & @SystemDir & "\mmsys.cpl,,0")
   $output = $output+1
   If ($output>1) Then
		 $t = MsgBox (4, "MówMi" ,"Aplikacja MówMi wymaga sterownika VB Audio Cable"& @LF &"Po zainstalowaniu sterownika uruchom MówMi jeszcze raz" & @LF & "Czy chcesz pobrac teraz sterowniki?")
		 If $t = 6 Then
			ShellExecute("https://vb-audio.com/Cable/")
		 Exit
	  ElseIf $t = 7 Then
		 MsgBox($MB_SYSTEMMODAL, "MówMi", "Bez sterowników aplikacja nie działa poprawnie i zostanie teraz zamknięta" , 10)
		 Exit
	  EndIf
   EndIf
WEnd
 While (StringInStr("CABLE Output (VB-Audio Virtual Cable)",getRecording())<1)
   MsgBox($MB_SYSTEMMODAL, "MówMi", "Ok, a teraz sprawdź czy jako Twój główny mikrofon ustawiony jest:" & @LF & "CABLE Output (VB-Audio Virtual Cable)" , 10)
   RunWait(@SystemDir & "\rundll32.exe Shell32.dll,Control_RunDLL " & @SystemDir & "\mmsys.cpl,,1")
   $input = $input+1
   If ($input>1) Then
		 $t = MsgBox (4, "MówMi" ,"Aplikacja MówMi wymaga sterownika VB Audio Cable"& @LF &"Po zainstalowaniu sterownika uruchom MówMi jeszcze raz" & @LF & "Czy chcesz pobrac teraz sterowniki?")
		 If $t = 6 Then
			ShellExecute("https://vb-audio.com/Cable/")
		 Exit
	  ElseIf $t = 7 Then
		 MsgBox($MB_SYSTEMMODAL, "MówMi", "Bez sterowników aplikacja nie działa poprawnie i zostanie teraz zamknięta" , 10)
		 Exit
	  EndIf
   EndIf
WEnd
$pid = ShellExecute("chrome.exe", "--new-window --app=https://monito.cloud/mowmi/app/index.html --window-position=100,100 --window-size=700,500No to ide robic kroki bo mam 4155 dopiero. Zdzwaniamy sie 2 --use-fake-ui-for-media-stream --chrome-frame")
Sleep(1000)
WinSetOnTop ( "MówMi", "", 1 )
WinMove ( "MówMi", "", @DesktopWidth-720, @DesktopHeight-530 ,700,500,1 )
if @error Then
   $t = MsgBox (4, "MówMi" ,"Aplikacja MówMi wymaga zainstalowanej przegladarki Google Chrome."& @LF &"Po zainstalowaniu przegladarki uruchom MówMi jeszcze raz" & @LF & "Czy chcesz pobrac teraz Google Chrome?")
   If $t = 6 Then
	  ShellExecute("https://www.google.com/intl/pl_pl/chrome/")
	  Exit
   ElseIf $t = 7 Then
	   Exit
   EndIf
EndIf



