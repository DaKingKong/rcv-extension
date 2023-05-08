import React from 'react';

const listStyle = {
    display: 'flex',
    flexDirection: 'row-reverse',
    marginRight: '6px',
}

export function ViewerList({
    viewers
}) {
    function getInitials({ name }) {
        const nameSegments = name.split(' ');
        let initials = '';
        for (const seg of nameSegments) {
            initials += seg[0];
        }
        return initials;
    }

    function getProfileImageStyle({ index, count }) {
        return {
            pointerEvents: 'none',
            fontFamily: 'sans-serif',
            width: '20px',
            borderRadius: '50%',
            height: '20px',
            background: "#0684BC",
            fontSize: '10px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: "#FFFFFF",
            transform: `translateX(${30 * index}%)`,
            zIndex: (count - index).toString()
        }
    }

    function getListItem({ viewers }) {
        if (viewers.length > 4) {
            let style = getProfileImageStyle({ index: 0, count: viewers.length });
            let result = [<div key={v} style={style}>{getInitials({ name: `+${viewers.length - 4}` })}</div>];
            let counter = 0;
            for (const viewer of viewers) {
                counter++;
                style = getProfileImageStyle({ index: counter, count: viewers.length });
                if (counter > 4) {
                    return result;
                }
                else {
                    result.push(<div key={counter} style={style}>{getInitials({ name: viewer })}</div>);
                }
            }
        }
        else {
            return viewers.map((v, i) => {
                let style = getProfileImageStyle({ index: i, count: viewers.length });
                return <div key={i} style={style}>{getInitials({ name: v })}</div>
            })
        }
    }

    return (
        <div style={listStyle}        >
            {getListItem({ viewers })}
        </div>
    )
}