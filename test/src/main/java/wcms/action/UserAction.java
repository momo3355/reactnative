package wcms.action;


import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
 










import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import wcms.action.FileWriter;
import wcms.model.Board;
import wcms.service.BoardService;


import wcms.service.MemberService;



import javax.validation.Valid;

import org.springframework.validation.BindingResult;


import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.ui.Model;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.GenericXmlApplicationContext;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.stereotype.Controller;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.util.FileCopyUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;











import org.junit.Before;



/*
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations={"/spring/appServlet-context.xml","/spring/data-db.xml"})
*/

@Controller

public class UserAction {

	


	@Autowired
	private BoardService boardservice;
	
	
	private Board board;
	private FileWriter fileWriter;
	private FileOutputStream  fos;
	
	@Before
	public void setup(){
	
	}
	/*	
	@Test
	public void conut() {
		ApplicationContext context = new GenericXmlApplicationContext("applicationContext-service.xml");
		MemberService memberService = context.getBean("memberService", MemberService.class);		info = homeDao.getInfoDao().getInfo();
		assertThat(info.getCustomer(), is("충청북도교육정보원"));
		System.out.println(info.getVersion());
		System.out.println(info.getCustomer());
		System.out.println("aaaa");		

	}
	/*

	@RequestMapping(value="/{id}/login.do", method = RequestMethod.GET)	
	public ModelAndView adminMgrList(@PathVariable("id") String id){
		
		System.out.println("test==="+id);
		info =infoservice.getInfo();
		System.out.println("====="+info.getVersion());
		System.out.println(info.getCustomer());	

		
		ModelAndView modelAndView = new ModelAndView();
	//	model.addAttribute();
		modelAndView.setViewName("/template/wcms/login");		
		modelAndView.addObject("info", info);		
		return modelAndView;
		
		
	}*/
	
	
	
	@RequestMapping(value="/{id}/userAdd.do", method=RequestMethod.POST)	
	public String login(@ModelAttribute("/template/wcms/user") @PathVariable("id") String id){
		
		System.out.println("loginsub==="+id);
		
		return "redirect:wcms/login.do";
		
		
	}

	
	@RequestMapping(value="/{id}/layout")	
	public String  layout(@PathVariable("id") String id){
		System.out.println("loginsub==="+id);
		
		return "layouts-tiles";     		
		
	}
	
	@RequestMapping(value="/{id}/hellow", method = RequestMethod.GET)	
	public String  loginSubmot2(@ModelAttribute("uploadForm") Board board, @PathVariable("id") String id, Model model,  HttpSession session){
		System.out.println("loginsub==="+id);
		String email = (String)session.getAttribute("loginmembe_eamil");
		System.out.println("이메일===="+ (String)session.getAttribute("loginmembe_eamil"));
		model.addAttribute("title", "테스트입니다.");
		model.addAttribute("board", new Board());
	
		System.out.println("이메일마지막값===="+ (String)session.getAttribute("loginmembe_eamil"));
		
		System.out.println(session.getCreationTime());
		System.out.println(session.getLastAccessedTime()); 		
		System.out.println(session.getMaxInactiveInterval());
		
		return "/template/wcms/hello";
		//return "user/tiles";     		
		
	}
	
	
	@RequestMapping(value="/{id}/user", method = RequestMethod.GET)	
	public String  loginSubmot(@ModelAttribute("uploadForm") Board board, @PathVariable("id") String id, Model model){
		System.out.println("loginsub==="+id);
		model.addAttribute("title", "테스트입니다.");
		model.addAttribute("board", new Board());
		return "/template/wcms/user";
		//return "user/tiles";     		
		
	}
	

	
	
	@RequestMapping(value = "/{id}/save", method = RequestMethod.POST)
	public String save(@ModelAttribute("uploadForm")  @Valid Board board, BindingResult bindingResult, @PathVariable("id") String id, HttpSession session, Model map)throws Exception  {
		System.out.println("loginsub==="+id);
		System.out.println("name==="+board.getName());
		System.out.println("pass==="+board.getPassword());
		System.out.println("content==="+board.getContent());
		
		
		List<MultipartFile> files = board.getFiles();
		         
         
        if(null != files && files.size() > 0) {
            for (MultipartFile multipartFile : files) {
            	
			          	if (!multipartFile.isEmpty()){ 
			            String fileName = multipartFile.getOriginalFilename();
			        		//System.out.println("file name : "+multipartFile.getName());
			        		//System.out.println("file getOriginalFilename : "+ multipartFile.getOriginalFilename());
			        		//System.out.println("file type : "+ multipartFile.getContentType());
			        		//System.out.println("file size : "+ multipartFile.getSize());
			        	//	System.out.println("file size : "+ multipartFile.getInputStream());                
			        		
			            byte fileDate[]=multipartFile.getBytes();
			            String uploadPath = session.getServletContext().getRealPath("/DATA/");		
			            File file = new File(uploadPath+"/"+multipartFile.getOriginalFilename());
			            System.out.println(file);
			            multipartFile.transferTo(file); 	
			          	}
            }
        }

		 

		
		boardservice.insertboard(board);		

		
		  if(bindingResult.hasErrors()){

	            System.out.println("폼 점검중입니다.");

	    		return "/template/wcms/user";

	        }else{

	            return "/template/wcms/user";

	        }
		
}	
	/*
	@RequestMapping(value = "/{id}/save", method = RequestMethod.POST)
	public String save(@ModelAttribute("uploadForm")  @Valid Board board, BindingResult bindingResult, @PathVariable("id") String id, HttpSession session, Model map)throws Exception  {
		System.out.println("loginsub==="+id);
		System.out.println("name==="+board.getName());
		System.out.println("pass==="+board.getPassword());
		System.out.println("content==="+board.getContent());
		
		List<MultipartFile> files = board.getFiles();
		List<String> fileNames = new ArrayList<String>();
 
		
		for (MultipartFile file : files) {
		
		System.out.println("file name : "+ file.getName());
		System.out.println("file getOriginalFilename : "+ file.getOriginalFilename());
		System.out.println("file type : "+ file.getContentType());
		System.out.println("file size : "+ file.getSize());
		System.out.println("file size : "+ file.getInputStream());
		
		 
		String uploadPath = session.getServletContext().getRealPath("/DATA/");		 
		InputStream inputStream = null;
		OutputStream outputStream = null;
 
		
		//업로드 방법 1
		
		try{
		 inputStream = file.getInputStream();

		 File realUploadDir = new File(uploadPath);						
		 outputStream = new FileOutputStream(uploadPath+file.getOriginalFilename());			 
		 int readBytes = 0;
		 byte[] buffer = new byte[8192];
         //FileCopyUtils.copy(file.getInputStream(), new FileOutputStream(uploadPath+"/"+file.getOriginalFilename()));
			 while((readBytes = inputStream.read(buffer, 0, 8192)) != -1){
				 	outputStream.write(buffer, 0, readBytes);
			 }
		 }catch(Exception e) {
					e.getStackTrace();
				}finally{
							outputStream.close();
							inputStream.close();
				}
			
		}
	

		
	//	boardservice.insertboard(board);		
		  if(bindingResult.hasErrors()){

	            System.out.println("폼 점검중입니다.");

	    		return "/template/wcms/user";

	        }else{

	            return "/template/wcms/user";

	        }
		
}
*/
}