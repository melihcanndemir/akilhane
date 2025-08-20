#!/usr/bin/env python3
"""
AkılHane Project Checker - GUI Version
PyQt5 ile Glassmorphism Tasarım
Gelişmiş Test Özellikleri ve Dark/Light Mode
"""

import sys
import subprocess
import os
import time
import json
from datetime import datetime
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from PyQt5.QtGui import *
import qdarkstyle

class Colors:
    """Renk paleti"""
    PRIMARY = "#3b82f6"
    SECONDARY = "#8b5cf6"
    SUCCESS = "#10b981"
    WARNING = "#f59e0b"
    ERROR = "#ef4444"
    INFO = "#06b6d4"
    DARK_BG = "#0f172a"
    DARK_CARD = "#1e293b"
    LIGHT_BG = "#ffffff"
    LIGHT_CARD = "#f8fafc"

class GlassmorphismWidget(QWidget):
    """Glassmorphism efekti için özel widget"""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setStyleSheet("""
            QWidget {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
            }
        """)

class TestResult:
    """Test sonuçları için sınıf"""
    
    def __init__(self, name, status, duration, output="", error=""):
        self.name = name
        self.status = status  # "success", "error", "warning"
        self.duration = duration
        self.output = output
        self.error = error
        self.timestamp = datetime.now()

class AkilhaneCheckerGUI(QMainWindow):
    """Ana GUI sınıfı"""
    
    def __init__(self):
        super().__init__()
        self.setWindowTitle("🧠 AkılHane Checker - GUI Version")
        self.setGeometry(100, 100, 1200, 800)
        
        # Dark mode varsayılan
        self.dark_mode = True
        self.test_results = []
        self.current_test = None
        
        # Proje kök dizinini bul
        self.project_root = self.find_project_root()
        
        self.init_ui()
        self.apply_theme()
        
    def find_project_root(self):
        """Proje kök dizinini bul"""
        current_dir = os.getcwd()
        
        # Eğer scripts dizinindeyse, bir üst dizine çık
        if os.path.basename(current_dir) == "scripts":
            return os.path.dirname(current_dir)
        
        # package.json dosyasını ara
        while current_dir != os.path.dirname(current_dir):
            if os.path.exists(os.path.join(current_dir, "package.json")):
                return current_dir
            current_dir = os.path.dirname(current_dir)
        
        # Bulunamazsa mevcut dizini kullan
        return os.getcwd()
        
    def find_node_path(self):
        """Node.js yolunu bul"""
        
        # Yaygın Node.js kurulum yolları
        possible_paths = [
            r"C:\Program Files\nodejs\node.exe",
            r"C:\Program Files (x86)\nodejs\node.exe",
            r"C:\Users\{}\AppData\Roaming\npm\node.exe".format(os.getenv('USERNAME', '')),
            r"C:\Users\{}\AppData\Local\Programs\nodejs\node.exe".format(os.getenv('USERNAME', '')),
        ]
        
        # PATH'ten node'u ara
        try:
            result = subprocess.run(["where", "node"], capture_output=True, text=True)
            if result.returncode == 0:
                return result.stdout.strip().split('\n')[0]
        except:
            pass
        
        # Olası yollardan birini dene
        for path in possible_paths:
            if os.path.exists(path):
                return path
                
        return None
        
    def find_npm_path(self):
        """npm yolunu bul"""
        
        # Yaygın npm kurulum yolları
        possible_paths = [
            r"C:\Program Files\nodejs\npm.cmd",
            r"C:\Program Files (x86)\nodejs\npm.cmd",
            r"C:\Users\{}\AppData\Roaming\npm\npm.cmd".format(os.getenv('USERNAME', '')),
            r"C:\Users\{}\AppData\Local\Programs\nodejs\npm.cmd".format(os.getenv('USERNAME', '')),
        ]
        
        # PATH'ten npm'i ara
        try:
            result = subprocess.run(["where", "npm"], capture_output=True, text=True)
            if result.returncode == 0:
                return result.stdout.strip().split('\n')[0]
        except:
            pass
        
        # Olası yollardan birini dene
        for path in possible_paths:
            if os.path.exists(path):
                return path
                
        return None
        
    def find_npx_path(self):
        """npx yolunu bul"""
        
        # Yaygın npx kurulum yolları
        possible_paths = [
            r"C:\Program Files\nodejs\npx.cmd",
            r"C:\Program Files (x86)\nodejs\npx.cmd",
            r"C:\Users\{}\AppData\Roaming\npm\npx.cmd".format(os.getenv('USERNAME', '')),
            r"C:\Users\{}\AppData\Local\Programs\nodejs\npx.cmd".format(os.getenv('USERNAME', '')),
        ]
        
        # PATH'ten npx'i ara
        try:
            result = subprocess.run(["where", "npx"], capture_output=True, text=True)
            if result.returncode == 0:
                return result.stdout.strip().split('\n')[0]
        except:
            pass
        
        # Olası yollardan birini dene
        for path in possible_paths:
            if os.path.exists(path):
                return path
                
        return None
        
    def init_ui(self):
        """UI bileşenlerini başlat"""
        
        # Ana widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # Ana layout
        main_layout = QVBoxLayout(central_widget)
        main_layout.setSpacing(20)
        main_layout.setContentsMargins(20, 20, 20, 20)
        
        # Header
        self.create_header(main_layout)
        
        # Kontrol paneli
        self.create_control_panel(main_layout)
        
        # Test sonuçları
        self.create_results_panel(main_layout)
        
        # Log paneli
        self.create_log_panel(main_layout)
        
        # Status bar
        self.statusBar().showMessage(f"Hazır - Proje: {self.project_root}")
        
    def create_header(self, parent_layout):
        """Header bölümü"""
        
        header_widget = GlassmorphismWidget()
        header_layout = QHBoxLayout(header_widget)
        
        # Logo ve başlık
        title_label = QLabel("🧠 AKILHANE CHECKER")
        title_label.setStyleSheet("""
            QLabel {
                font-size: 24px;
                font-weight: bold;
                color: #3b82f6;
            }
        """)
        
        # Proje dizini
        path_label = QLabel(f"📁 {os.path.basename(self.project_root)}")
        path_label.setStyleSheet("""
            QLabel {
                font-size: 12px;
                color: #64748b;
            }
        """)
        
        # Theme toggle
        self.theme_btn = QPushButton("🌙 Dark Mode")
        self.theme_btn.clicked.connect(self.toggle_theme)
        self.theme_btn.setStyleSheet("""
            QPushButton {
                background: rgba(59, 130, 246, 0.2);
                border: 1px solid rgba(59, 130, 246, 0.3);
                border-radius: 8px;
                padding: 8px 16px;
                color: #3b82f6;
                font-weight: bold;
            }
            QPushButton:hover {
                background: rgba(59, 130, 246, 0.3);
            }
        """)
        
        header_layout.addWidget(title_label)
        header_layout.addWidget(path_label)
        header_layout.addStretch()
        header_layout.addWidget(self.theme_btn)
        
        parent_layout.addWidget(header_widget)
        
    def create_control_panel(self, parent_layout):
        """Kontrol paneli"""
        
        control_widget = GlassmorphismWidget()
        control_layout = QVBoxLayout(control_widget)
        
        # Başlık
        control_title = QLabel("🔧 Test Kontrolleri")
        control_title.setStyleSheet("font-size: 18px; font-weight: bold; margin-bottom: 10px;")
        control_layout.addWidget(control_title)
        
        # Butonlar
        button_layout = QHBoxLayout()
        
        # Lint Test
        self.lint_btn = QPushButton("🔍 Lint Test")
        self.lint_btn.clicked.connect(lambda: self.run_test("lint"))
        self.lint_btn.setStyleSheet(self.get_button_style("info"))
        
        # TypeScript Test
        self.ts_btn = QPushButton("📝 TypeScript Test")
        self.ts_btn.clicked.connect(lambda: self.run_test("typescript"))
        self.ts_btn.setStyleSheet(self.get_button_style("info"))
        
        # Build Test
        self.build_btn = QPushButton("🏗️ Build Test")
        self.build_btn.clicked.connect(lambda: self.run_test("build"))
        self.build_btn.setStyleSheet(self.get_button_style("info"))
        
        # Tüm Testler
        self.all_btn = QPushButton("🚀 Tüm Testler")
        self.all_btn.clicked.connect(self.run_all_tests)
        self.all_btn.setStyleSheet(self.get_button_style("success"))
        
        # Temizle
        self.clear_btn = QPushButton("🗑️ Temizle")
        self.clear_btn.clicked.connect(self.clear_results)
        self.clear_btn.setStyleSheet(self.get_button_style("warning"))
        
        button_layout.addWidget(self.lint_btn)
        button_layout.addWidget(self.ts_btn)
        button_layout.addWidget(self.build_btn)
        button_layout.addWidget(self.all_btn)
        button_layout.addWidget(self.clear_btn)
        
        control_layout.addLayout(button_layout)
        parent_layout.addWidget(control_widget)
        
    def create_results_panel(self, parent_layout):
        """Test sonuçları paneli"""
        
        results_widget = GlassmorphismWidget()
        results_layout = QVBoxLayout(results_widget)
        
        # Başlık
        results_title = QLabel("📊 Test Sonuçları")
        results_title.setStyleSheet("font-size: 18px; font-weight: bold; margin-bottom: 10px;")
        results_layout.addWidget(results_title)
        
        # Sonuçlar tablosu
        self.results_table = QTableWidget()
        self.results_table.setColumnCount(5)
        self.results_table.setHorizontalHeaderLabels([
            "Test", "Durum", "Süre", "Zaman", "Detay"
        ])
        self.results_table.setStyleSheet("""
            QTableWidget {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                gridline-color: rgba(255, 255, 255, 0.1);
            }
            QHeaderView::section {
                background: rgba(59, 130, 246, 0.2);
                color: #3b82f6;
                font-weight: bold;
                padding: 8px;
                border: none;
            }
        """)
        
        # Sütun genişlikleri
        self.results_table.setColumnWidth(0, 150)
        self.results_table.setColumnWidth(1, 100)
        self.results_table.setColumnWidth(2, 80)
        self.results_table.setColumnWidth(3, 150)
        self.results_table.setColumnWidth(4, 300)
        
        results_layout.addWidget(self.results_table)
        parent_layout.addWidget(results_widget)
        
    def create_log_panel(self, parent_layout):
        """Log paneli"""
        
        log_widget = GlassmorphismWidget()
        log_layout = QVBoxLayout(log_widget)
        
        # Başlık
        log_title = QLabel("📝 Detaylı Log")
        log_title.setStyleSheet("font-size: 18px; font-weight: bold; margin-bottom: 10px;")
        log_layout.addWidget(log_title)
        
        # Log text area
        self.log_text = QTextEdit()
        self.log_text.setMaximumHeight(200)
        self.log_text.setStyleSheet("""
            QTextEdit {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: #e2e8f0;
                font-family: 'Consolas', monospace;
                font-size: 12px;
                padding: 10px;
            }
        """)
        
        log_layout.addWidget(self.log_text)
        parent_layout.addWidget(log_widget)
        
    def get_button_style(self, color_type):
        """Buton stilleri"""
        
        colors = {
            "info": "#3b82f6",
            "success": "#10b981", 
            "warning": "#f59e0b",
            "error": "#ef4444"
        }
        
        color = colors.get(color_type, "#3b82f6")
        
        return f"""
            QPushButton {{
                background: rgba({color}, 0.2);
                border: 1px solid rgba({color}, 0.3);
                border-radius: 8px;
                padding: 12px 20px;
                color: {color};
                font-weight: bold;
                font-size: 14px;
            }}
            QPushButton:hover {{
                background: rgba({color}, 0.3);
            }}
            QPushButton:pressed {{
                background: rgba({color}, 0.4);
            }}
        """
        
    def apply_theme(self):
        """Tema uygula"""
        
        if self.dark_mode:
            self.setStyleSheet(qdarkstyle.load_stylesheet_pyqt5())
            self.theme_btn.setText("🌙 Dark Mode")
        else:
            self.setStyleSheet("")
            self.theme_btn.setText("☀️ Light Mode")
            
    def toggle_theme(self):
        """Tema değiştir"""
        
        self.dark_mode = not self.dark_mode
        self.apply_theme()
        
    def run_test(self, test_type):
        """Test çalıştır"""
        
        self.current_test = test_type
        self.statusBar().showMessage(f"{test_type.upper()} testi çalışıyor...")
        
        # Thread'de çalıştır
        self.test_thread = TestThread(test_type, self.project_root)
        self.test_thread.result_ready.connect(self.on_test_complete)
        self.test_thread.start()
        
    def run_all_tests(self):
        """Tüm testleri çalıştır"""
        
        self.statusBar().showMessage("Tüm testler çalışıyor...")
        
        # Sırayla çalıştır
        tests = ["lint", "typescript", "build"]
        self.test_queue = tests.copy()
        self.run_next_test()
        
    def run_next_test(self):
        """Sıradaki testi çalıştır"""
        
        if self.test_queue:
            test = self.test_queue.pop(0)
            self.run_test(test)
        else:
            self.statusBar().showMessage("Tüm testler tamamlandı!")
            
    def on_test_complete(self, result):
        """Test tamamlandığında"""
        
        self.test_results.append(result)
        self.update_results_table()
        self.update_log(result)
        
        # Buton durumunu güncelle
        self.update_button_status(result)
        
        self.statusBar().showMessage(f"{result.name} testi tamamlandı!")
        
    def update_results_table(self):
        """Sonuçlar tablosunu güncelle"""
        
        self.results_table.setRowCount(len(self.test_results))
        
        for i, result in enumerate(self.test_results):
            # Test adı
            self.results_table.setItem(i, 0, QTableWidgetItem(result.name))
            
            # Durum
            status_item = QTableWidgetItem()
            if result.status == "success":
                status_item.setText("✅ Başarılı")
                status_item.setBackground(QColor(Colors.SUCCESS))
            elif result.status == "error":
                status_item.setText("❌ Hata")
                status_item.setBackground(QColor(Colors.ERROR))
            else:
                status_item.setText("⚠️ Uyarı")
                status_item.setBackground(QColor(Colors.WARNING))
            self.results_table.setItem(i, 1, status_item)
            
            # Süre
            self.results_table.setItem(i, 2, QTableWidgetItem(f"{result.duration:.2f}s"))
            
            # Zaman
            self.results_table.setItem(i, 3, QTableWidgetItem(
                result.timestamp.strftime("%H:%M:%S")
            ))
            
            # Detay
            detail = result.output[:50] + "..." if len(result.output) > 50 else result.output
            self.results_table.setItem(i, 4, QTableWidgetItem(detail))
            
    def update_log(self, result):
        """Log'u güncelle"""
        
        timestamp = result.timestamp.strftime("%H:%M:%S")
        
        if result.status == "success":
            log_entry = f"[{timestamp}] ✅ {result.name}: Başarılı ({result.duration:.2f}s)\n"
        elif result.status == "error":
            log_entry = f"[{timestamp}] ❌ {result.name}: Hata ({result.duration:.2f}s)\n"
            if result.error:
                log_entry += f"    Hata: {result.error}\n"
        else:
            log_entry = f"[{timestamp}] ⚠️ {result.name}: Uyarı ({result.duration:.2f}s)\n"
            
        if result.output:
            # Karakter kodlaması düzeltmeleri - ASCII yaklaşımı
            output = result.output
            # Yaygın bozuk karakterleri düzelt
            output = output.replace("âœ\"", "[OK]")
            output = output.replace("â\"", "->")
            output = output.replace("â\"", "-")
            output = output.replace("â\"", "L")
            output = output.replace("â\"", "T")
            output = output.replace("â\"", "|")
            output = output.replace("â\"", "+")
            output = output.replace("â\"", "+")
            output = output.replace("â\"", "L")
            output = output.replace("â\"", "T")
            output = output.replace("â\"", "T")
            output = output.replace("â\"", "L")
            
            log_entry += f"    Çıktı: {output}\n"
            
        # Gerçek zamanlı güncelleme
        self.log_text.append(log_entry)
        self.log_text.ensureCursorVisible()
        
        # Scroll'u en alta taşı
        cursor = self.log_text.textCursor()
        cursor.movePosition(cursor.End)
        self.log_text.setTextCursor(cursor)
        
    def update_button_status(self, result):
        """Buton durumunu güncelle"""
        
        if result.name == "Lint Test":
            if result.status == "success":
                self.lint_btn.setStyleSheet(self.get_button_style("success"))
            else:
                self.lint_btn.setStyleSheet(self.get_button_style("error"))
        elif result.name == "TypeScript Test":
            if result.status == "success":
                self.ts_btn.setStyleSheet(self.get_button_style("success"))
            else:
                self.ts_btn.setStyleSheet(self.get_button_style("error"))
        elif result.name == "Build Test":
            if result.status == "success":
                self.build_btn.setStyleSheet(self.get_button_style("success"))
            else:
                self.build_btn.setStyleSheet(self.get_button_style("error"))
                
    def clear_results(self):
        """Sonuçları temizle"""
        
        self.test_results.clear()
        self.results_table.setRowCount(0)
        self.log_text.clear()
        
        # Butonları sıfırla
        self.lint_btn.setStyleSheet(self.get_button_style("info"))
        self.ts_btn.setStyleSheet(self.get_button_style("info"))
        self.build_btn.setStyleSheet(self.get_button_style("info"))
        
        self.statusBar().showMessage("Sonuçlar temizlendi")

class TestThread(QThread):
    """Test thread'i"""
    
    result_ready = pyqtSignal(object)
    
    def __init__(self, test_type, project_root):
        super().__init__()
        self.test_type = test_type
        self.project_root = project_root
        
    def find_node_path(self):
        """Node.js yolunu bul"""
        
        # Yaygın Node.js kurulum yolları
        possible_paths = [
            r"C:\Program Files\nodejs\node.exe",
            r"C:\Program Files (x86)\nodejs\node.exe",
            r"C:\Users\{}\AppData\Roaming\npm\node.exe".format(os.getenv('USERNAME', '')),
            r"C:\Users\{}\AppData\Local\Programs\nodejs\node.exe".format(os.getenv('USERNAME', '')),
        ]
        
        # PATH'ten node'u ara
        try:
            result = subprocess.run(["where", "node"], capture_output=True, text=True)
            if result.returncode == 0:
                return result.stdout.strip().split('\n')[0]
        except:
            pass
        
        # Olası yollardan birini dene
        for path in possible_paths:
            if os.path.exists(path):
                return path
                
        return None
        
    def find_npx_path(self):
        """npx yolunu bul"""
        
        # Yaygın npx kurulum yolları
        possible_paths = [
            r"C:\Program Files\nodejs\npx.cmd",
            r"C:\Program Files (x86)\nodejs\npx.cmd",
            r"C:\Users\{}\AppData\Roaming\npm\npx.cmd".format(os.getenv('USERNAME', '')),
            r"C:\Users\{}\AppData\Local\Programs\nodejs\npx.cmd".format(os.getenv('USERNAME', '')),
        ]
        
        # PATH'ten npx'i ara
        try:
            result = subprocess.run(["where", "npx"], capture_output=True, text=True)
            if result.returncode == 0:
                return result.stdout.strip().split('\n')[0]
        except:
            pass
        
        # Olası yollardan birini dene
        for path in possible_paths:
            if os.path.exists(path):
                return path
                
        return None
        
    def run(self):
        """Test'i çalıştır"""
        
        start_time = time.time()
        
        try:
            if self.test_type == "lint":
                result = self.run_lint_test()
            elif self.test_type == "typescript":
                result = self.run_typescript_test()
            elif self.test_type == "build":
                result = self.run_build_test()
            else:
                result = TestResult("Unknown", "error", 0, "", "Unknown test type")
                
        except Exception as e:
            duration = time.time() - start_time
            result = TestResult(self.test_type, "error", duration, "", str(e))
            
        self.result_ready.emit(result)
        
    def run_lint_test(self):
        """Lint testi"""
        
        start_time = time.time()
        
        try:
            # Proje kök dizinine geç
            original_dir = os.getcwd()
            os.chdir(self.project_root)
            
            # Windows için shell=True kullan
            result = subprocess.run(
                "npx next lint --fix",
                shell=True,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            # Orijinal dizine geri dön
            os.chdir(original_dir)
            
            duration = time.time() - start_time
            
            if result.returncode == 0:
                return TestResult(
                    "Lint Test",
                    "success",
                    duration,
                    result.stdout,
                    result.stderr
                )
            else:
                return TestResult(
                    "Lint Test",
                    "error",
                    duration,
                    result.stdout,
                    result.stderr
                )
                
        except subprocess.TimeoutExpired:
            duration = time.time() - start_time
            return TestResult(
                "Lint Test",
                "error",
                duration,
                "",
                "Timeout expired"
            )
        except Exception as e:
            duration = time.time() - start_time
            return TestResult(
                "Lint Test",
                "error",
                duration,
                "",
                str(e)
            )
            
    def run_typescript_test(self):
        """TypeScript testi"""
        
        start_time = time.time()
        
        try:
            # Proje kök dizinine geç
            original_dir = os.getcwd()
            os.chdir(self.project_root)
            
            # Windows için shell=True kullan
            result = subprocess.run(
                "npx tsc --noEmit",
                shell=True,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            # Orijinal dizine geri dön
            os.chdir(original_dir)
            
            duration = time.time() - start_time
            
            if result.returncode == 0:
                return TestResult(
                    "TypeScript Test",
                    "success",
                    duration,
                    result.stdout,
                    result.stderr
                )
            else:
                return TestResult(
                    "TypeScript Test",
                    "error",
                    duration,
                    result.stdout,
                    result.stderr
                )
                
        except subprocess.TimeoutExpired:
            duration = time.time() - start_time
            return TestResult(
                "TypeScript Test",
                "error",
                duration,
                "",
                "Timeout expired"
            )
        except Exception as e:
            duration = time.time() - start_time
            return TestResult(
                "TypeScript Test",
                "error",
                duration,
                "",
                str(e)
            )
            
    def run_build_test(self):
        """Build testi"""
        
        start_time = time.time()
        
        try:
            # Proje kök dizinine geç
            original_dir = os.getcwd()
            os.chdir(self.project_root)
            
            # Windows için shell=True kullan
            result = subprocess.run(
                "npm run build",
                shell=True,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            # Orijinal dizine geri dön
            os.chdir(original_dir)
            
            duration = time.time() - start_time
            
            if result.returncode == 0:
                return TestResult(
                    "Build Test",
                    "success",
                    duration,
                    result.stdout,
                    result.stderr
                )
            else:
                return TestResult(
                    "Build Test",
                    "error",
                    duration,
                    result.stdout,
                    result.stderr
                )
                
        except subprocess.TimeoutExpired:
            duration = time.time() - start_time
            return TestResult(
                "Build Test",
                "error",
                duration,
                "",
                "Timeout expired"
            )
        except Exception as e:
            duration = time.time() - start_time
            return TestResult(
                "Build Test",
                "error",
                duration,
                "",
                str(e)
            )

def main():
    """Ana fonksiyon"""
    
    app = QApplication(sys.argv)
    
    # Uygulama ayarları
    app.setApplicationName("AkılHane Checker GUI")
    app.setApplicationVersion("2.0.0")
    
    # Ana pencere
    window = AkilhaneCheckerGUI()
    window.show()
    
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()
