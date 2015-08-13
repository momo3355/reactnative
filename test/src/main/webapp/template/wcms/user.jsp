<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<style>

  .errorMsg { font-size:12px;

                  color: red; }

</style>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>답글형 게시판 예제</title>
<link rel="stylesheet" type="text/css" href="resources/css/board.css" />
<script type="text/javascript" src="resources/js/util.js"></script>
<script type="text/javascript">

</script>
</head>
<body>
<div id="content">
<h3>${title}</h3>
<form:form modelAttribute="uploadForm" method="post" action="save.do" onsubmit="return checkForm(this)" enctype="multipart/form-data">
<table>
	<tr>
		<th align="center" width="60">작성자</th>
		<td><form:input path="name" name="name" size="20" />&nbsp;
			
		</td>
	</tr>
	<tr>
		<th align="center">암호</th>
		<td><form:password path="password" name="password" size="20" />&nbsp;
			<span class="error-text" id="error_password"></span>
		</td>
	</tr>
	
	<tr>
		<th align="center">제목</th>
		<td><form:input path="title" name="title" size="80"/>&nbsp;
		</td>
	</tr>
	<tr>
		<th align="center">내용</th>
		<td><form:textarea path="content" name="content" cssStyle="margin:0px; width:600px; height:400px" /><br />		
		<form:errors  path="content"  id="content" cssClass="errorMsg"></form:errors>	
		</td>
	</tr>
	<tr>
	<td>
	<input type="file" name="files[0]" />
	<input type="file" name="files[1]" />		
	</td>
	</tr>	
	<div align="center">
	<input type="submit" value="확인" />&nbsp
</div>
</table><br />

</form:form>
</div>
</body>
</html>