(async () => {
  const $ = (selector) => document.querySelector(selector);
  const colors = ['#173fc2', '#73a9e8', '#81b979', '#ecab58', '#a985d3', '#e17f91', '#52b8ae'];
  const colorFor = (index) => colors[index % colors.length];
  const durationOf = (record) => Number(record.sessionTimeSeconds) || 0;
  const formatDuration = (seconds) => {
    const totalMinutes = Math.floor(Math.round(seconds) / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours) return `${hours} h ${minutes} min`;
    if (totalMinutes) return `${totalMinutes} min`;
    return `${Math.round(seconds)} s`;
  };
  const timeAgo = (date) => {
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
    if (seconds < 60) return 'Hace unos segundos';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `Hace ${days} días`;
    const months = Math.floor(days / 30);
    return `Hace ${months} mes${months === 1 ? '' : 'es'}`;
  };

  let records;
  try {
    const response = await fetch('log.json');
    if (!response.ok) throw new Error(`No se pudo cargar log.json (${response.status})`);
    records = await response.json();
    if (!Array.isArray(records)) throw new Error('log.json no contiene una lista de registros');
  } catch (error) {
    $('#loadError').hidden = false;
    return;
  }

  const zones = [...new Set(records.map((record) => record.zona))].sort();
  const regions = [...new Set(records.map((record) => record.region || 'Sin región'))].sort();
  const zoneMetadata = Object.fromEntries(records.map((record) => [record.zona, record.region || 'Sin región']));
  const months = [...new Set(records.map((record) => record.startTime.slice(0, 7)))].sort();
  const zoneFilter = $('#zoneFilter');

  zones.forEach((zone) => {
    const option = document.createElement('option');
    option.value = zone;
    option.textContent = zone;
    zoneFilter.append(option);
  });

  function renderChart(filteredRecords, selectedZone) {
    const chart = $('#chart');
    const legend = $('#chartLegend');
    chart.replaceChildren();
    legend.replaceChildren();

    const series = selectedZone === 'all' ? regions : [selectedZone];
    const seriesLabel = (name) => selectedZone === 'all' ? name : `${name} · ${zoneMetadata[name] || 'Sin región'}`;
    const getSeriesRecords = (month, name) => filteredRecords.filter((record) => {
      if (!record.startTime.startsWith(month)) return false;
      return selectedZone === 'all'
        ? (record.region || 'Sin región') === name
        : record.zona === name;
    });
    const valuesByMonth = months.map((month) => series.map((name) => ({
      name,
      seconds: getSeriesRecords(month, name).reduce((total, record) => total + durationOf(record), 0)
    })));
    const maxMonthSeconds = Math.max(0, ...valuesByMonth.map((seriesValues) => seriesValues.reduce((sum, item) => sum + item.seconds, 0)));

    if (!months.length || !filteredRecords.length || maxMonthSeconds === 0) {
      const empty = document.createElement('p');
      empty.className = 'chart-empty';
      empty.textContent = 'No hay sesiones para graficar con esta selección.';
      chart.append(empty);
      return;
    }

    months.forEach((month, monthIndex) => {
      const monthColumn = document.createElement('div');
      monthColumn.className = 'chart-month';
      const values = valuesByMonth[monthIndex];
      const monthTotal = values.reduce((sum, item) => sum + item.seconds, 0);
      const total = document.createElement('span');
      total.className = 'chart-total';
      total.textContent = `${(monthTotal / 3600).toFixed(1)} h`;
      monthColumn.append(total);

      const stack = document.createElement('div');
      stack.className = 'chart-stack';
      stack.setAttribute('role', 'img');
      stack.setAttribute('aria-label', `${month}: ${(monthTotal / 3600).toFixed(1)} horas`);
      values.forEach((item, seriesIndex) => {
        if (!item.seconds) return;
        const segment = document.createElement('span');
        const hours = item.seconds / 3600;
        segment.className = 'bar-segment';
        segment.style.height = `${Math.max(2, (item.seconds / maxMonthSeconds) * 100)}%`;
        segment.style.backgroundColor = colorFor(seriesIndex);
        segment.title = `${seriesLabel(item.name)}: ${hours.toFixed(2)} h`;
        segment.setAttribute('aria-label', segment.title);
        stack.append(segment);
      });
      monthColumn.append(stack);

      const label = document.createElement('span');
      label.className = 'month-label';
      label.textContent = new Date(`${month}-01T12:00:00`).toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
      monthColumn.append(label);
      chart.append(monthColumn);
    });

    series.forEach((name, index) => {
      const item = document.createElement('span');
      const swatch = document.createElement('i');
      swatch.style.backgroundColor = colorFor(index);
      item.append(swatch, document.createTextNode(seriesLabel(name)));
      legend.append(item);
    });
  }

  function render() {
    const selectedZone = zoneFilter.value;
    const filteredRecords = records.filter((record) => selectedZone === 'all' || record.zona === selectedZone);
    const users = new Set(filteredRecords.map((record) => record.usuario));
    $('#totalSessions').textContent = filteredRecords.length.toLocaleString('es-MX');
    $('#uniqueUsers').textContent = users.size.toLocaleString('es-MX');
    $('#totalTime').textContent = formatDuration(filteredRecords.reduce((total, record) => total + durationOf(record), 0));

    const latest = [...filteredRecords].sort((a, b) => b.startTime.localeCompare(a.startTime))[0];
    $('#lastAgo').textContent = latest ? timeAgo(latest.startTime) : '—';
    $('#lastWhen').textContent = latest
      ? new Date(latest.startTime).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
      : 'Sin actividad';

    renderChart(filteredRecords, selectedZone);

    const zoneRows = $('#zoneRows');
    zoneRows.replaceChildren();
    const displayedZones = selectedZone === 'all' ? zones : [selectedZone];
    displayedZones.forEach((zone) => {
      const zoneRecords = filteredRecords.filter((record) => record.zona === zone);
      const lastRecord = [...zoneRecords].sort((a, b) => b.startTime.localeCompare(a.startTime))[0];
      const row = document.createElement('tr');
      [zone, zoneMetadata[zone] || 'Sin región', zoneRecords.length,
        new Set(zoneRecords.map((record) => record.usuario)).size,
        formatDuration(zoneRecords.reduce((total, record) => total + durationOf(record), 0)),
        lastRecord ? timeAgo(lastRecord.startTime) : '—'].forEach((value, index) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        if (index === 0) {
          const strong = document.createElement('strong');
          strong.textContent = value;
          cell.replaceChildren(strong);
        }
        row.append(cell);
      });
      zoneRows.append(row);
    });

    const recentRows = $('#recentRows');
    recentRows.replaceChildren();
    [...filteredRecords].sort((a, b) => b.startTime.localeCompare(a.startTime)).slice(0, 20).forEach((record) => {
      const row = document.createElement('tr');
      const values = [record.zona, record.usuario, record.plataforma,
        new Date(record.startTime).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }),
        formatDuration(durationOf(record)), timeAgo(record.startTime)];
      values.forEach((value, index) => {
        const cell = document.createElement('td');
        if (index === 2) {
          const tag = document.createElement('span');
          tag.className = 'tag';
          tag.textContent = value;
          cell.append(tag);
        } else {
          cell.textContent = value;
        }
        row.append(cell);
      });
      recentRows.append(row);
    });
  }

  zoneFilter.addEventListener('change', render);
  render();
  setInterval(render, 60000);
})();
