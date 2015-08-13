<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form" %>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring" %> 
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Insert title here</title>
</head>
<body> 
<h1> Login1</h1>
<form name='loginForm'  action='/login/loginAction.do'   method='POST'>
    User : <input type='text' name='id' value=''/>
    Password : <input type='password' name='pass' />
    <input name="submit" type="submit"/>
    <input name="reset" type="reset"/>
</form>

         </body>
         
         
      </html>