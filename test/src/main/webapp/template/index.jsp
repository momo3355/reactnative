<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>jqGrid 예제</title>
<link rel="stylesheet" type="text/css" href="resources/css/smoothness/jquery-ui-1.10.3.custom.min.css">
<link rel="stylesheet" type="text/css" href="resources/css/jqgrid/ui.jqgrid.css">
<script type="text/javascript" src="resources/js/jquery-1.9.1.js"></script>
<script type="text/javascript" src="resources/js/jqgrid/i18n/grid.locale-kr.js"></script>
<script type="text/javascript" src="resources/js/jqgrid/minified/jquery.jqGrid.min.js"></script>
<script type="text/javascript">
$(document).ready(function() {
	$("#list").jqGrid({
		url: "read",
		datatype: "json",
		height: "auto",
		colNames: ["employee_id","first_name","last_name","email",
		           "phone_number","hire_date", "job_id", "salary", 
		           "commission_pct", "manager_id", "department_id"],
		colModel: [
			{name: "id", index: "employee_id", editable: false},
			{name: "first_name", index: "first_name", editable: true},
			{name: "last_name", index: "last_name", editable: true},
			{name: "email", index: "email", editable: true},
			{name: "phone_number", index: "phone_number", editable: true},
			{name: "hire_date", index: "hire_date", editable: true},
			{name: "job_id", index: "job_id", editable: true},
			{name: "salary", index: "salary", editable: true, align: "right"},
			{name: "commission_pct", index: "commission_pct", editable: true, align: "right"},
			{name: "manager_id", index: "manager_id", editable: true},
			{name: "department_id", index: "department_id", editable: true}
		],
		sortable: true,
		rowNum: 10,
		sortname: "employee_id",
		autowidth: true,
		rowList: [10, 20, 30],
		pager: "#pager",
		viewrecords: true,
		caption: "Employees",
		editurl: "edit"
	});
	
	$("#list").jqGrid("navGrid", "#pager",
		{edit: true, add:true, del:true},
		{closeAfterEdit: true, reloadAfterSubmit: true},
		{closeAfterAdd: true, reloadAfterSubmit: true},
		{reloadAfterSubmit: true},
		{sopt : ["eq","ne","lt","le","gt","ge","bw","bn","ew","en","cn","nc","in","ni"]});
});
</script>
</head>
<body>
<h3>Oracle, Spring, MyBatis, jqGrid 예제</h3>
<table border="1px" id="list">
	<tr><td></td></tr>
</table>
<div id="pager"></div>
</body>
</html>