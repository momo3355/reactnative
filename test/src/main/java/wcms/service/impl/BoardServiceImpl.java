package wcms.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import wcms.dao.BoardDao;
import wcms.model.Board;
import wcms.service.BoardService;

@Service 
public class BoardServiceImpl implements BoardService {

	@Autowired
	private BoardDao boardDao;
	
	@Override
	public  void  insertboard(Board board)  {
		boardDao.insertboard(board);
	}
	
}
