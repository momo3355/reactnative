package wcms.action;


import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.GenericXmlApplicationContext;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.junit.Before;

import static org.junit.Assert.*; 
import static org.hamcrest.CoreMatchers.*; 
/*


@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations={"/resource/spring/applicationContext-db.xml","/resource/spring/applicationContext-service.xml"})

public class CopyOfWcmsAction {

	@Autowired
	private HomeDao homeDao;		
	
	private Info info;
	
	
	@Before
	public void setup(){
	
	}
	
	@Test
	public void conut() {
		//ApplicationContext context = new GenericXmlApplicationContext("applicationContext-service.xml");
		//InfoService infoService = context.getBean("infoService", InfoService.class);
		info = homeDao.getInfoDao().getInfo();
		assertThat(info.getCustomer(), is("충청북도교육정보원"));
		System.out.println(info.getVersion());
		System.out.println(info.getCustomer());
		System.out.println("aaaa");
	}

	
	
	
	@RequestMapping("/{id}/login.do")	
	public ModelAndView adminMgrList(@PathVariable("id") String id){
		System.out.println("이야"+id);
		info = homeDao.getInfoDao().getInfo();
		System.out.println(info.getVersion());
		System.out.println(info.getCustomer());
		System.out.println("aaaaaa");	

		
		ModelAndView modelAndView = new ModelAndView();
		modelAndView.setViewName("/template/wcms/login");		
		return modelAndView;
		
	}

}
*/