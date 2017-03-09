package ch.uzh.ifi.feedback.library.rest;

import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Enumeration;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.mysql.jdbc.AbandonedConnectionCleanupThread;

/**
 * This class is responsible for unregistering of database drivers after the ServletContext has been destroyed. 
 * This will prevent potential memory leaks.
 * 
 * @author Florian Schüpfer
 * @version 1.0
 * @since   2016-11-14
 */
public class ContextFinalizer implements ServletContextListener {

    private static final Log LOGGER = LogFactory.getLog(ContextFinalizer.class);

    public void contextInitialized(ServletContextEvent sce) {
    }

    public void contextDestroyed(ServletContextEvent sce) {
        Enumeration<Driver> drivers = DriverManager.getDrivers();
        Driver d = null;
        while(drivers.hasMoreElements()) {
            try {
                d = drivers.nextElement();
                DriverManager.deregisterDriver(d);
                LOGGER.warn(String.format("Driver %s deregistered", d));
                
            } catch (SQLException ex) {
                LOGGER.warn(String.format("Error deregistering driver %s", d), ex);
            }
        }
        try {
            AbandonedConnectionCleanupThread.shutdown();
        } catch (InterruptedException e) {
        	LOGGER.warn("SEVERE problem cleaning up: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
