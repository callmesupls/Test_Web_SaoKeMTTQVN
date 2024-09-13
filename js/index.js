(function () {
    $(function () {
        var _$table = $('#StatementTable');
        var _$statementTableTable;

        $('#StartEndRange').daterangepicker({
            locale: {
                format: 'DD/MM/YYYY',
                applyLabel: 'Áp dụng',
                cancelLabel: 'Hủy',
                fromLabel: 'Từ',
                toLabel: 'Đến',
                customRangeLabel: 'Tùy chọn',
                weekLabel: 'Tuần',
                daysOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
                monthNames: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
                firstDay: 1
            },
            autoUpdateInput: false
        });

        $('#StartEndRange').on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('DD/MM/YYYY') + ' – ' + picker.endDate.format('DD/MM/YYYY'));
        });

        $('#StartEndRange').on('cancel.daterangepicker', function (ev, picker) {
            $(this).val('');
        });

        function showLoading() {
            $('#loading-overlay').show();
        }

        function hideLoading() {
            $('#loading-overlay').hide();
        }

        function reloadDataTable(searchTerm, startDate, endDate) {
            showLoading(); // Hiển thị lớp phủ

            $.ajax({
                url: 'Data/saoke0109-1009.csv',
                type: 'GET',
                dataType: 'text',
                success: function (csvData) {
                    Papa.parse(csvData, {
                        header: true,
                        dynamicTyping: true,
                        skipEmptyLines: true,
                        fastMode: true,
                        worker: true,
                        complete: function (results) {
                            var filteredData = results.data.filter(function (row) {
                                var rowDate = new Date(row.date);
                                var startDateObj = startDate ? new Date(startDate.split('/').reverse().join('/')) : null;
                                var endDateObj = endDate ? new Date(endDate.split('/').reverse().join('/')) : null;

                                var dateMatch = (!startDateObj || rowDate >= startDateObj) && (!endDateObj || rowDate <= endDateObj);
                                var termMatch = !searchTerm || row.notes.toLowerCase().includes(searchTerm.toLowerCase());

                                return dateMatch && termMatch;
                            });

                            if (_$statementTableTable) {
                                _$statementTableTable.clear().rows.add(filteredData).draw();
                            } else {
                                _$statementTableTable = _$table.DataTable({
                                    data: filteredData,
                                    paging: true,
                                    processing: true,
                                    searching: false,
                                    language: {
                                        emptyTable: "Không tìm thấy dữ liệu",
                                        lengthMenu: "Hiển thị _MENU_ bản ghi",
                                    },
                                    bInfo: false,
                                    bLengthChange: true,
                                    lengthMenu: [
                                        [5, 10, 25, 50],
                                        [5, 10, 25, 50],
                                    ],
                                    pageLength: 10,
                                    order: [[2, 'Desc']],
                                    columnDefs: [
                                        {
                                            targets: 0,
                                            orderable: true,
                                            render: function (data, type, row, meta) {
                                                return meta.row + meta.settings._iDisplayStart + 1;
                                            }
                                        },
                                        {
                                            targets: 1,
                                            data: 'date',
                                            orderable: true,
                                            render: function (data, type, row, meta) {
                                                return row.date + "<br>" + row.code;
                                            }
                                        },
                                        {
                                            targets: 2,
                                            data: 'amount',
                                            orderable: true,
                                            render: function (data, type, row, meta) {
                                                if (type === 'display') {
                                                    return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                                }
                                                return data;
                                            }
                                        },
                                        {
                                            targets: 3,
                                            data: 'notes',
                                            orderable: false,
                                        }
                                    ]
                                });
                            }

                            hideLoading();
                        }
                    });
                },
                error: function (error) {
                    console.error("Lỗi rồi:", error);
                    hideLoading();
                }
            });
        }

        $('#Search').on('click', function () {
            var searchTerm = $('#SearchTerm').val();
            var dateRange = $('#StartEndRange').val().split(' – ');

            var startDate = dateRange[0] ? dateRange[0].trim() : null;
            var endDate = dateRange[1] ? dateRange[1].trim() : null;

            reloadDataTable(searchTerm, startDate, endDate);
        });

        reloadDataTable();
    });
})();
