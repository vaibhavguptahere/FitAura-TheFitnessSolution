class WeightGraph {
    constructor(canvas, entries) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.entries = entries;
      this.padding = 40;
      this.tooltip = this.createTooltip();
      this.hoveredPoint = null;
      this.resizeCanvas();
      
      window.addEventListener('resize', () => this.resizeCanvas());
      this.setupEventListeners();
    }
  
    createTooltip() {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      this.canvas.parentElement.appendChild(tooltip);
      return tooltip;
    }
  
    setupEventListeners() {
      this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      this.canvas.addEventListener('mouseleave', () => {
        this.hoveredPoint = null;
        this.tooltip.style.display = 'none';
        this.draw();
      });
    }
  
    handleMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const sortedEntries = [...this.entries].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      if (!sortedEntries.length) return;
      
      const weights = sortedEntries.map(e => e.weight);
      const minWeight = Math.min(...weights);
      const maxWeight = Math.max(...weights);
      
      const xScale = (this.canvas.width - this.padding * 2) / (sortedEntries.length - 1);
      const yScale = (this.canvas.height - this.padding * 2) / (maxWeight - minWeight);
      
      let closestPoint = null;
      let minDistance = Infinity;
      
      sortedEntries.forEach((entry, i) => {
        const pointX = this.padding + i * xScale;
        const pointY = this.canvas.height - this.padding - (entry.weight - minWeight) * yScale;
        
        const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2);
        if (distance < 20 && distance < minDistance) {
          minDistance = distance;
          closestPoint = { entry, x: pointX, y: pointY };
        }
      });
      
      if (closestPoint) {
        this.hoveredPoint = closestPoint;
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = `${closestPoint.x + rect.left - rect.left}px`;
        this.tooltip.style.top = `${closestPoint.y + rect.top - rect.top - 40}px`;
        this.tooltip.innerHTML = `
          <strong>${new Date(closestPoint.entry.date).toLocaleDateString()}</strong><br>
          ${closestPoint.entry.weight} kg
        `;
      } else {
        this.hoveredPoint = null;
        this.tooltip.style.display = 'none';
      }
      
      this.draw();
    }
  
    resizeCanvas() {
      const container = this.canvas.parentElement;
      this.canvas.width = container.clientWidth;
      this.canvas.height = 300;
      this.draw();
    }
  
    draw() {
      if (!this.entries.length) return;
      
      const ctx = this.ctx;
      const width = this.canvas.width;
      const height = this.canvas.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Sort entries by date
      const sortedEntries = [...this.entries].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      // Find min and max values
      const weights = sortedEntries.map(e => e.weight);
      const minWeight = Math.min(...weights);
      const maxWeight = Math.max(...weights);
      const padding = this.padding;
      
      // Calculate scales
      const xScale = (width - padding * 2) / (sortedEntries.length - 1);
      const yScale = (height - padding * 2) / (maxWeight - minWeight);
      
      // Draw grid
      ctx.beginPath();
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      
      // Vertical grid lines
      for (let i = 0; i < sortedEntries.length; i++) {
        const x = padding + i * xScale;
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
      }
      
      // Horizontal grid lines
      const weightStep = (maxWeight - minWeight) / 5;
      for (let i = 0; i <= 5; i++) {
        const y = height - padding - (i * (height - padding * 2) / 5);
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
      }
      ctx.stroke();
      
      // Draw axes
      ctx.beginPath();
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      
      // Y-axis
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      
      // X-axis
      ctx.moveTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();
      
      // Draw labels
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.font = '12px Arial';
      ctx.fillStyle = '#666';
      
      // Y-axis labels
      for (let i = 0; i <= 5; i++) {
        const y = height - padding - (i * (height - padding * 2) / 5);
        const weight = (minWeight + i * weightStep).toFixed(1);
        ctx.fillText(weight, padding - 5, y);
      }
      
      // Draw data line with gradient
      const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
      gradient.addColorStop(0, '#646cff');
      gradient.addColorStop(1, '#535bf2');
      
      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      
      sortedEntries.forEach((entry, i) => {
        const x = padding + i * xScale;
        const y = height - padding - (entry.weight - minWeight) * yScale;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      
      // Draw points
      sortedEntries.forEach((entry, i) => {
        const x = padding + i * xScale;
        const y = height - padding - (entry.weight - minWeight) * yScale;
        
        ctx.beginPath();
        if (this.hoveredPoint && this.hoveredPoint.entry === entry) {
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#535bf2';
        } else {
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#646cff';
        }
        ctx.fill();
        ctx.stroke();
      });
    }
  }
  
  class WeightTracker {
    constructor() {
      this.entries = [];
      this.form = document.getElementById('weight-form');
      this.weightInput = document.getElementById('weight');
      this.dateInput = document.getElementById('date');
      this.entriesList = document.getElementById('entries-list');
      this.averageWeight = document.getElementById('average-weight');
      this.canvas = document.getElementById('weight-graph');
      
      this.graph = new WeightGraph(this.canvas, this.entries);
      
      this.initializeEventListeners();
      this.setDefaultDate();
      this.updateStats();
    }
  
    initializeEventListeners() {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addEntry();
      });
  
      // Add sort functionality to table headers
      document.querySelectorAll('th').forEach(header => {
        header.addEventListener('click', () => {
          const column = header.textContent.toLowerCase();
          this.sortEntries(column);
        });
      });
    }
  
    setDefaultDate() {
      const today = new Date().toISOString().split('T')[0];
      this.dateInput.value = today;
    }
  
    addEntry() {
      const weight = parseFloat(this.weightInput.value);
      const date = this.dateInput.value;
  
      if (!weight || !date) {
        this.showNotification('Please fill in all fields', 'error');
        return;
      }
  
      if (this.entries.some(entry => entry.date === date)) {
        this.showNotification('An entry for this date already exists', 'error');
        return;
      }
  
      const entry = { weight, date };
      this.entries.push(entry);
      this.renderEntries();
      this.updateStats();
      this.graph.draw();
      this.resetForm();
      this.showNotification('Entry added successfully', 'success');
    }
  
    showNotification(message, type) {
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  
    sortEntries(column) {
      this.entries.sort((a, b) => {
        if (column === 'date') {
          return new Date(b.date) - new Date(a.date);
        } else {
          return b.weight - a.weight;
        }
      });
      this.renderEntries();
    }
  
    renderEntries() {
      this.entriesList.innerHTML = '';
      
      const sortedEntries = [...this.entries].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
  
      sortedEntries.forEach((entry, index) => {
        const tr = document.createElement('tr');
        tr.className = 'new-entry';
        
        const trend = this.getWeightTrend(entry, index);
        const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '–';
        const trendClass = trend > 0 ? 'trend-up' : trend < 0 ? 'trend-down' : '';
        
        tr.innerHTML = `
          <td>${this.formatDate(entry.date)}</td>
          <td class="weight-cell">
            ${entry.weight} kg
            <span class="weight-trend ${trendClass}">${trendIcon} ${Math.abs(trend).toFixed(1)} kg</span>
          </td>
          <td>
            <button class="delete-btn" data-index="${index}">Delete</button>
          </td>
        `;
  
        const deleteBtn = tr.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => this.deleteEntry(index));
  
        this.entriesList.appendChild(tr);
      });
    }
  
    getWeightTrend(entry, index) {
      if (index === this.entries.length - 1) return 0;
      
      const nextEntry = this.entries[index + 1];
      return entry.weight - nextEntry.weight;
    }
  
    deleteEntry(index) {
      this.entries.splice(index, 1);
      this.renderEntries();
      this.updateStats();
      this.graph.draw();
      this.showNotification('Entry deleted', 'success');
    }
  
    updateStats() {
      if (this.entries.length === 0) {
        document.querySelector('.stats').innerHTML = `
          <div class="stat-item">
            <div class="stat-label">Average Weight</div>
            <div class="stat-value">0 kg</div>
          </div>
        `;
        return;
      }
  
      const weights = this.entries.map(e => e.weight);
      const average = weights.reduce((a, b) => a + b) / weights.length;
      const min = Math.min(...weights);
      const max = Math.max(...weights);
      const latest = this.entries[0].weight;
      const first = this.entries[this.entries.length - 1].weight;
      const totalChange = latest - first;
  
      document.querySelector('.stats').innerHTML = `
        <div class="stat-item">
          <div class="stat-label">Average Weight</div>
          <div class="stat-value">${average.toFixed(1)} kg</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Total Change</div>
          <div class="stat-value ${totalChange > 0 ? 'trend-up' : 'trend-down'}">
            ${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)} kg
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Range</div>
          <div class="stat-value">${min.toFixed(1)} - ${max.toFixed(1)} kg</div>
        </div>
      `;
    }
  
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  
    resetForm() {
      this.weightInput.value = '';
      this.setDefaultDate();
      this.weightInput.focus();
    }
  }
  
  // Initialize the weight tracker
  const weightTracker = new WeightTracker();