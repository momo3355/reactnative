package wcms.servlet;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.FileInputStream;
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ImageServlet extends javax.servlet.http.HttpServlet implements javax.servlet.Servlet {

	private static final long serialVersionUID = -5658577193086957498L;

	public ImageServlet() {
		super();
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		String FilePath = (String)request.getAttribute("FilePath");

		byte[] bufferSize = new byte[response.getBufferSize()];
		
		int len;

		response.resetBuffer();
		response.reset();
		response.setContentType("image/jpeg"); 
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
