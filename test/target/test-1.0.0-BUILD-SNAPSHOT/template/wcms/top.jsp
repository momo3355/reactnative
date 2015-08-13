<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>WCMS Administrator</title>
<link rel="stylesheet" href="./css/wcms.css" type="text/css" >
<script language="javascript" src="./js/wcms.js"></script>
</head>
<body style="margin:5px;">

	<div style="padding:10px; margin-bottom:10px">
		<div style="float:left"><a href="javascript:alert('WCMS Administrator')"><img src="./images/wcms.gif" width="150" height="12" alt="WCMS Administrator"/></a></div>
		<div style="float:right"><a href="./logout.do" target="_top"><img src="./images/logout.gif" width="45" height="10" alt="logout"/></a></div>
	</div>

	<div style="border-bottom:solid 2px #CCCCCC">

		<table border="0" cellpadding="0" cellspacing="0" width="100%">
		<tr height="22">
			<td width="146px"><input type="text" style="width:137px; border:solid 2px #528ED8; background:url(/template/wcms/images/bg_search.gif) right;"/></td>
			<td style="padding-bottom:1px">
				<div style="background:url(./images/bg_menu_bar.gif); height:22px">
				<table border="0" cellpadding="0" cellspacing="0" width="100%">
				<tr>
					<td width="10">.</td>
					<td width="104" align="center"><a href="./userList.do" target="main" onclick="setMenu(1)"><img id="MenuImg1" src="./images/menu_01_off.gif" width="94" height="22" onmouseover="menuover(this,1)" onmouseout="menuout(this,1)"/></a></td>
					<td width="107" align="center"><a href="./siteList.do" target="main" onclick="setMenu(2)"><img id="MenuImg2" src="./images/menu_02_off.gif" width="97" height="22" onmouseover="menuover(this,2)" onmouseout="menuout(this,2)"/></a></td>
					<td width="92" align="center"><a href="./menu.do" target="main" onclick="setMenu(3)"><img id="MenuImg3" src="./images/menu_03_off.gif" width="82" height="22" onmouseover="menuover(this,3)" onmouseout="menuout(this,3)"/></a></td>
					<td width="103" align="center"><a href="./board.do" target="main" onclick="setMenu(4)"><img id="MenuImg4" src="./images/menu_04_off.gif" width="93" height="22" onmouseover="menuover(this,4)" onmouseout="menuout(this,4)"/></a></td>
					<!-- <td width="99" align="center"><a href="./minwon.do" target="main" onclick="setMenu(5)"><img id="MenuImg5" src="./images/menu_05_off.gif" width="89" height="22" onmouseover="menuover(this,5)" onmouseout="menuout(this,5)"/></a></td> -->
					<td width="117" align="center"><a href="./program.do" target="main" onclick="setMenu(7)"><img id="MenuImg7" src="./images/menu_06_off.gif" width="107" height="22" onmouseover="menuover(this,7)" onmouseout="menuout(this,7)"/></a></td>
				   <td width="117" align="center"><a href="./lecture.do" target="main" onclick="setMenu(7)"><img id="MenuImg7" src="./images/menu_06_off.gif" width="107" height="22" onmouseover="menuover(this,7)" onmouseout="menuout(this,7)"/></a></td>
					<td>.</td>
					<td width="122" align="center"><a href="http://service.hanshinit.co.kr/?code1=JH9NGAJRFE5WFU3D0C25N&code2=FD9MKZEW0X57HWX4B7R2F" target="main" onclick="setMenu(8)"><img id="MenuImg8" src="./images/as_off.gif" width="112" height="22" onmouseover="menuover(this,8)" onmouseout="menuout(this,8)"/></a></td>
				</tr>
				</table>
				</div>
			</td>
		</tr>
		</table>

	</div>

	<div style="padding:7px 0px 0px 20px; height:26px; background:url(./images/bg_sub_menu_bar.gif);">
		<div id="menu0" style="display:none;"></div>
		<div id="menu1" style="display:none; padding-left:140px">
			<a href="./userList.do" target="main">사용자관리</a> |
			<a href="./userPart.do" target="main">부서관리</a> |
			<a href="./userGroup.do" target="main">그룹관리</a>
			<!--상세조회-->
		</div>
		<div id="menu2" style="display:none; padding-left:245px">
			<a href="./siteList.do" target="main">사이트관리</a> |
			<!--<a href="./siteForward.do" target="main">포워딩관리</a> |-->
			<a href="./log.do" target="main">로그분석</a> |
			<a href="./popupzone.do" target="main">팝업존관리</a> |
			<a href="./banner.do" target="main">배너존관리</a> |
			<a href="./link.do" target="main">링크관리</a>
		</div>
		<div id="menu3" style="display:none; padding-left:280px; color:#999999">
			각 사이트의 메뉴와 컨텐츠를 관리 합니다.
		</div>
		<div id="menu4" style="display:none; padding-left:380px; color:#999999">
			각 게시판의 설정과 게시물을 조회 합니다.
		</div>
		<div id="menu5" style="display:none; padding-left:510px; color:#999999">
			각 민원게시판을 설정 합니다.
		</div>
		<div id="menu7" style="display:none; padding-left:580px; color:#999999">
			각 프로그램의 담당자를 지정하고 관리합니다.
		</div>
		<div id="menu8" style="display:none; padding-right:10px; text-align:right; color:#999999">
			<a href="http://www.hanshinit.co.kr" target="_blank" title="새창">(주)한신정보기술</a>의 서비스관리시스템에 연결합니다.
		</div>
		<div id="menu9" style="display:none; padding-right:10px; text-align:right; color:#999999">
		<!--  -->
		</div>
	</div>

</body>
</html>