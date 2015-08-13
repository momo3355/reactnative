<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Ajax 예제</title>

<script src="/js/jquery-1.11.1.js"></script>

<script>
function doAjaxboardlistCnt(){
	
	jQuery.ajax({
       
        url:"/ysm/ajaxselect.do",
      
        type: "GET",
   
        dataType:"JSON", // 옵션이므로 JSON으로 받을게 아니면 안써도 됨

        success : function(data) {     	                	 
        	     alert(data.id);
        	     alert(data.name);
        	   
        },

        error : function(xhr, status, error) {
			alert(xhr);
			alert(status);
			alert(error);
            alert("에러발생");

        }


  	});

}

    



</script>

</head>
<body>
<input type="button" value="추가" onclick="doAjaxboardlistCnt()">

</table>
</body>
</html>