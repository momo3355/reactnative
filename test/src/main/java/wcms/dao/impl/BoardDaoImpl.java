package wcms.dao.impl;



import wcms.dao.BoardDao;

import wcms.model.Board;

import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.ibatis.SqlMapClientTemplate;
import org.springframework.orm.ibatis.support.SqlMapClientDaoSupport;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.util.List;


@Repository
public class BoardDaoImpl  implements BoardDao {

	
	@Autowired
	public SqlMapClientTemplate sqlMapClientTemplate;
	
	
	@Transactional
	public void  insertboard(Board board) {
		sqlMapClientTemplate.insert("insertBoard", board);	
	}
	
	
	
}

