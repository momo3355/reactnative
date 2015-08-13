package wcms.servlet;

import java.io.IOException;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.FileInputStream;
import java.io.File;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

 public class DownloadServlet extends javax.servlet.http.HttpServlet implements javax.servlet.Servlet {

	static final long serialVersionUID = 11212312352345L;
   
	public DownloadServlet() {
		super();
	}   	

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		String RFileName = (String)request.getAttribute("RFileName");
		RFileName = java.net.URLEncoder.encode(RFileName,"UTF-8").replace("+", " ");
		String FilePath = (String)request.getAttribute("FileDownPath");

		File file = new File(FilePath);
		
		byte[] bufferSize = new byte[response.getBufferSize()];
		
		int len;

		response.resetBuffer();
		response.reset();
		response.setContentType("Content-type:application/octet-stream"); 
		response.setContentLength((int)file.length());  
		response.setHeader("Content-Disposition", "attachment;filename=" + RFileName + ";"); 
		response.setHeader("Content-type", "file/unknown"); 
		response.setHeader("Content-Description:", "JAVA Generated Data"); 
		response.setHeader("Pragma","no-cache;");
		response.setHeader("Expires","-1");
		response.setHeader("Cache-Control","cache, must-revalidate");
		response.flushBuffer();
		
		BufferedInputStream bis = null;
		BufferedOutputStream bos = null;
		
		try
		{
			
			bis = new BufferedInputStream(new FileInputStream(FilePath));
			bos = new BufferedOutputStream(response.getOutputStream());
			
			while ((len = bis.read(bufferSize, 0, bufferSize.length)) != -1)
			{
				bos.write(bufferSize, 0, len);
			}

		}
		catch(Exception e)
		{
			e.printStackTrace();
		}
		finally
		{
			bos.close();
			bis.close();
		}
		
	}  	

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}   	  	    
}