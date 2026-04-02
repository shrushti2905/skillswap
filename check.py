from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

options = Options()
options.add_argument('--headless')
driver = webdriver.Chrome(options=options)
driver.get("http://localhost:5500/")
time.sleep(2)
for entry in driver.get_log('browser'):
    print(entry)
driver.quit()