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

public class MainAction {

	@Autowired
	private BoardService boardservice;
	
	
	private Board board;
	private FileWriter fileWriter;
	private FileOutputStream  fos;
	
	@Before
	public void setup(){
	
	}
	
}